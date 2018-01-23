'use strict';

const fs      = require('fs')
const path    = require('path')
const mkdirp  = require('mkdirp')

/**
 * This task creates working directory for current project
 */
module.exports = function(project, settings) {
    return new Promise((resolve, reject) => {
        if (settings.logger) settings.logger(`[${project.uid}] setting up project...`);

        // setup project's workpath
        project.workpath = path.join(settings.workpath,   project.uid);

        // create, if it does not exists
        mkdirp.sync(project.workpath);

        // if we have project (template) as an asset
        for (let asset of project.assets) {
            if (asset.type && ['project', 'template'].indexOf(asset.type) !== -1) {
                return resolve(project);
            }
        }

        return reject(new Error("You should provide a project template file (aepx) as an asset."));
    });
};
