'use strict';

const mkdirp    = require('mkdirp');
const path      = require('path');
const fs        = require('fs-extra');
const async     = require('async');

const RESULTS_DIR = process.env.RESULTS_DIR || 'results';

/**
 * actions is a backward compability term
 * currently only means a synomym for 
 * "moving files from temp dir to results dir"
 */
module.exports = function(project) {
    return new Promise((resolve, reject) => {

        let src = path.join( project.workpath, project.resultname );
        let dst = path.join( RESULTS_DIR, project.uid + '_' + project.resultname );

        // create, if it does not exists
        mkdirp.sync(RESULTS_DIR);

        //TEMP: workaround for JPEG sequences mode
        if (project.settings && 
            project.settings.outputExt && 
            ['jpeg', 'jpg'].indexOf( 
                project.settings.outputExt.toLowerCase() 
            ) !== -1
        ) {
            console.info(`[${project.uid}] applying actions: found jpeg sequence...`);
            
            // scan folder
            fs.readdir(project.workpath, (err, files) => {
                if (err) return callback(err);

                // initialize empty call-queue array
                let calls = [];

                // resulting file sequrence filenames
                // NOTE: if you want to change this field, also goto tasks/render.js, and apply changes there too
                let exprs = new RegExp('result_[0-9]{5}');

                // override destination path for images
                let dst = path.join( RESULTS_DIR, project.uid );
                
                // create subdir for storing images in results folder for overrided path
                mkdirp.sync(dst);

                // look for still image sequence results
                for (let file of files) {
                    if (!exprs.test(file)) continue;

                    let local_src = path.join( project.workpath, file );
                    let local_dst = path.join( dst, file );

                    // add each move-file request to call queue
                    calls.push((callback) => {
                        
                        // if file exists -> remove it
                        fs.unlink(local_dst, () => {
                            //move file from src to dst
                            fs.move(local_src, local_dst, callback);
                        })
                    });
                }

                // start 'em in parallel
                async.parallel(calls, (err, results) => {
                    return (err) ? reject(err) : resolve(project);
                });
            });

            return;
        }

        // remove file if exists 
        fs.unlink(dst, (err) => {
            console.info(`[${project.uid}] applying actions: moving result file...`);

            // start file moving
            fs.move(src, dst, (err) => {
                return (err) ? reject(err) : resolve(project);
            });
        })
    });
};
