'use strict';

const path      = require('path');
const fs        = require('fs-extra');
const async     = require('async');

function getAllExpressions(data) {
    return data.match(/\<expr bdata=\"([a-f0-9]+)\"\s*\/\>/gi);
}

/**
 * This function tries to find and replace path to a data/script file
 * via regular expressions
 * It will match paths looking something like that:
 *     "/Users/Name/Projects/MyProject/"
 *     "C:\\Projects\\MyNewProject\\"
 *     "/usr/var/tmp/jobs/123/"
 *
 * And will replace them to string `dst`
 */
function replacePath(src, dst) {
    return src.replace( /(?:(?:[A-Z]\:|~){0,1}(?:\/|\\\\|\\)(?=[^\s\/]))(?:(?:[\ a-zA-Z0-9\+\-\_\.\$\●\-]+(?:\/|\\\\|\\)))*/gm, dst);
}

function processTemplateFile(job, callback) {
    // job file template name
    let jobName         = path.join( job.workpath, job.template );
    let replaceToPath   = path.join( process.cwd(), job.workpath, path.sep); // absolute path

    // escape single backslash to double in win
    replaceToPath = replaceToPath.replace(/\\/g, '\\\\');

    // read job file contents
    fs.readFile(jobName, (err, bin) => {
        if (err) return callback(err);

        // convert to utf8 string
        let data = bin.toString('utf8');

        // check for valid job template
        if (data.indexOf('<?xml') !== 0) return callback(new Error('Project is not valid xml job template'));

        // search for expressions
        let expressions = getAllExpressions(data);

        // check for existing expressions
        if (expressions !== null) {

            // then iterate over them
            for (let expr of expressions) {

                // extract hex from xml tag and decode it
                let hex = expr.split('"')[1];
                let dec = new Buffer(hex, 'hex').toString('utf8');

                // do patch and encode back to hex
                // using regex file path pattern
                let enc = new Buffer( replacePath( dec, replaceToPath ) ).toString('hex');

                // replace patched hex
                data = data.replace( hex, enc );
            }
        }

        // save result
        fs.writeFile(jobName, data, callback);
    });
}

/**
 * This task patches job
 * and replaces all the paths to srcripts
 * to ones that provided in job
 */
module.exports = function(job) {
    return new Promise((resolve, reject) => {

        console.info(`[${job.uid}] patching job...`);

        // Iterate over assets,
        // skip those that are not data/script assets,
        for (let asset of job.assets) {
            if (['script', 'data'].indexOf(asset.type) === -1) continue;

            return processTemplateFile(job, (err) => {
                return (err) ? reject(err) : resolve(job);
            });
        }

        // job contains no data/script assets, pass
        resolve(job);
    });
};
