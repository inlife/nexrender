'use strict';

const download = require('download');

/**
 * This task is used to download every asset in the "project.asset"
 */
module.exports = function(project) {
    return new Promise((resolve, reject) => {

        console.info(`[${project.uid}] downloading assets...`);

        // iterate over each asset to check for custom template
        for (let asset of project.assets) {
            // check for custom template
            if (asset.type === 'project') {
                project.template = asset.name;
            }
        }

        // iterate over each asset and download it
        Promise.all(project.assets.map(
                asset => download(asset.src, project.workpath)
        )).then(() => {
            return resolve(project);
        }).catch((err) => {
            return reject(err);
        });

    });
};
