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

        Jimp.read("lenna.png").then(function (lenna) {
            lenna.resize(256, 256)            // resize 
                 .quality(60)                 // set JPEG quality 
                 .greyscale()                 // set greyscale 
                 .write("lena-small-bw.jpg"); // save 
        }).catch(function (err) {
            console.error(err);
        });

        // run rename(move) callbacks in parallel
        async.parallel(calls, (err, results) => {
            return (err) ? reject(err) : resolve(project);
        })
    });
};