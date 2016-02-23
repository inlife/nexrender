'use strict';

const path        = require('path');
const fs          = require('fs-extra');

/**
 * This task patches project
 * and replaces all the paths to srcripts
 * to ones that provided in project
 */
module.exports = function(project) {
    return new Promise((resolve, reject) => {

        console.log(`[${project.uid}] patching project...`);

        // Iterate over assets, 
        // skip those that are not data/script files, 
        for (let asset of project.assets) {
            if (['script', 'data'].indexOf(asset.type) === -1) continue;

            // project file template name
            let projectName     = path.join( project.workpath, project.template );
            let replaceToPath   = path.join( process.cwd(), project.workpath, path.sep); // absolute path

            // read project file contents
            fs.readFile(projectName, (err, bin) => {
                if (err) return reject(err);

                // convert to utf8 string
                let data = bin.toString('utf8');

                // check for valid project template
                if (data.indexOf('<?xml') !== 0) return reject(new Error('Project is not valid xml project template'));

                // search for expressions
                let expressions = data.match(/\<expr bdata=\"([a-f0-9]+)\"\s*\/\>/ig);

                for (let expr of expressions) {
                    // extract hex from xml tag and decode it
                    let hex = expr.split('"')[1];
                    let dec = new Buffer(hex, 'hex').toString('utf8');

                    // do patch and encode back to hex
                    // using regex file path pattern
                    let enc = new Buffer( dec.replace( /([A-Z]\:|)(\/|\\)(.+(\/|\\)|)/gm, replaceToPath ) ).toString('hex');

                    // replace patched hex
                    data = data.replace( hex, enc );
                }

                // save result
                fs.writeFile(projectName, data, (err) => {
                    return (err) ? reject(err) : resolve(project);
                });
            });
        }

        resolve(project);
    });
};
