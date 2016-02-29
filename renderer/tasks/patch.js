'use strict';

const path      = require('path');
const fs        = require('fs-extra');
const async     = require('async');

function getAllExpressions(data) {
    return data.match(/\<expr bdata=\"([a-f0-9]+)\"\s*\/\>/gi);
}

function replacePath(src, dst) {
    return src.replace( /(?:(?:[A-Z]\:|~){0,1}(?:\/|\\\\|\\)(?=[^\s\/]))(?:(?:[\ a-zA-Z0-9\-\_\.\$\●\-]+(?:\/|\\\\|\\)))*/gm, dst);
}

function processTemplateFile(project, callback) {
    // project file template name
    let projectName     = path.join( project.workpath, project.template );
    let replaceToPath   = path.join( process.cwd(), project.workpath, path.sep); // absolute path

    // escape single backslash to double in win
    replaceToPath = replaceToPath.replace(/\\/g, '\\\\');

    // read project file contents
    fs.readFile(projectName, (err, bin) => {
        if (err) return callback(err);

        // convert to utf8 string
        let data = bin.toString('utf8');

        // check for valid project template
        if (data.indexOf('<?xml') !== 0) return callback(new Error('Project is not valid xml project template'));

        // search for expressions
        let expressions = getAllExpressions(data);

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

        // save result
        fs.writeFile(projectName, data, callback);
    });
}

/**
 * This task patches project
 * and replaces all the paths to srcripts
 * to ones that provided in project
 */
module.exports = function(project) {
    return new Promise((resolve, reject) => {

        console.info(`[${project.uid}] patching project...`);

        // Iterate over assets, 
        // skip those that are not data/script files, 
        for (let asset of project.assets) {
            if (['script', 'data'].indexOf(asset.type) === -1) continue;

            return processTemplateFile(project, (err) => {
                return (err) ? reject(err) : resolve(project);
            });
        }

        // project contains no data/script assets, pass
        resolve(project);
    });
};
