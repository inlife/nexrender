'use strict';

const jimp  = require('jimp');
const async = require('async');
const path  = require('path');

module.exports = function(project) {
    return new Promise((resolve, reject) => {

        console.info(`[${project.uid}] filtering image assets...`);

        // initialize empty call-queue array
        let calls = [];

        // iterate over asset, find images
        for (let asset of project.assets) {
            if (asset.type !== 'image') continue;
            if (!asset.filters || asset.filters.length < 1) continue;

            calls.push((callback) => {
                jimp.read( path.join( project.workpath, asset.name ), (err, image) => {
                    callback(err, [image, asset]);
                });
            });
        }

        // run rename(move) callbacks in parallel
        async.parallel(calls, (err, results) => {
            if (err) return reject(err);

            // iterate over each vaild asset
            for (let packed of results) {
                let image = packed[0];
                let asset = packed[1];

                // iterate over each defined filter for this asset
                for (let filter of asset.filters) {
                    // if that function is defined in jimp library
                    if (image[filter.name]) {
                        // call it
                        image[filter.name].apply(image, filter.params || []);
                    }
                }

                // save filtered image
                image.write( path.join( project.workpath, asset.name ));
            }

            // pass project to next task
            resolve(project);
        });
    });
};
