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
module.exports = function(job) {
    return new Promise((resolve, reject) => {

        let src = path.join( job.workpath, job.resultname );
        let dst = path.join( RESULTS_DIR, job.uid + '_' + job.resultname );

        // create, if it does not exists
        mkdirp.sync(RESULTS_DIR);

        //TEMP: workaround for JPEG sequences mode
        if (job.settings &&
            job.settings.outputExt &&
            ['jpeg', 'jpg'].indexOf(
                job.settings.outputExt.toLowerCase()
            ) !== -1
        ) {
            console.info(`[${job.uid}] applying actions: found jpeg sequence...`);

            // scan folder
            fs.readdir(job.workpath, (err, files) => {
                if (err) return callback(err);

                // initialize empty call-queue array
                let calls = [];

                // resulting file sequrence filenames
                // NOTE: if you want to change this field, also goto tasks/render.js, and apply changes there too
                let exprs = new RegExp('result_[0-9]{5}');

                // override destination path for images
                let dst = path.join( RESULTS_DIR, job.uid );

                // create subdir for storing images in results folder for overrided path
                mkdirp.sync(dst);

                // look for still image sequence results
                for (let file of files) {
                    if (!exprs.test(file)) continue;

                    let local_src = path.join( job.workpath, file );
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
                    return (err) ? reject(err) : resolve(job);
                });
            });

            return;
        }

        // remove file if exists
        fs.unlink(dst, () => {
            console.info(`[${job.uid}] applying actions: moving result file...`);

            // start file moving
            fs.move(src, dst, (err) => {
                return (err) ? reject(err) : resolve(job);
            });
        })
    });
};
