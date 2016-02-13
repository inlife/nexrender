'use strict';

const Download = require('download');

/**
 * This task is used to download every asset in the "project.asset"
 */
module.exports = function(project) {
    return new Promise((resolve, reject) => {

        console.log("downloading assets...");

        // create downloader
        let downloader = new Download();

        // set download path
        downloader.dest(project.workpath);

        // iterate over each asset
        for (let asset of project.assets) {
            downloader.get(asset.src);
        }
        
        // run download and return
        downloader.run((err, files) => {
            return (err) ? reject(err) : resolve([project, files]);
        });
    });
};