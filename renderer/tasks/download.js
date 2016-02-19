'use strict';

const Download = require('download');

/**
 * This task is used to download every asset in the "project.asset"
 */
module.exports = function(project) {
    return new Promise((resolve, reject) => {

        console.log(`[${project.uid}] downloading assets...`);

        // create downloader
        let downloader   = new Download();
        let projectFound = false;

        // set download path
        downloader.dest(project.workpath);

        // iterate over each asset
        for (let asset of project.assets) {
            downloader.get(asset.src);

            // check for custom project
            if (asset.type === 'project') {
                projectFound = true;
            }
        }

        if (project.type && project.type === 'custom') {
            if (!projectFound) {
                return reject(new Error('You selected custom project, but did not upload one'));
            }
        }
        
        // run download and return
        downloader.run((err, files) => {
            return (err) ? reject(err) : resolve(project);
        });
    });
};
