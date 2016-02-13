'use strict';

const jimp = require('jimp');

module.exports = function(project) {
    return new Promise((resolve, reject) => {

        console.log("filtering image assets...");

        // initialize empty call-queue array
        let calls = [];

        // iterate over asset, find images
        for (let asset of project.assets) {
            if (asset.type !== 'image') continue;

            calls.push((callback) => {
                
            });
        }

        // run rename(move) callbacks in parallel
        async.parallel(calls, (err, results) => {
            return (err) ? reject(err) : resolve(project);
        })
    });
};