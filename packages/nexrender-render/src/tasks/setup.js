'use strict';

const os      = require('os')
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

        // set default project result file name
        if (project.settings.outputExt) {
            project.resultname = 'result.' + project.settings.outputExt;
        }
        else {
            project.resultname = 'result.' + (os.platform() === 'darwin' ? 'mov' : 'avi');
        }

        // NOTE: for still (jpg) image sequence frame filename will be changed to result_[#####].jpg
        if (project.settings &&
            project.settings.outputExt &&
            ['jpeg', 'jpg'].indexOf(
                project.settings.outputExt.toLowerCase()
            ) !== -1
        ) {
            project.resultname = 'result_[#####]' + project.settings.outputExt;
        }


        // create if it does not exists
        mkdirp.sync(project.workpath);

        // check if we have project (template) as an asset
        for (let asset of project.assets) {
            if (asset.type && ['project', 'template'].indexOf(asset.type) !== -1) {
                project.template = asset.name;
                return resolve(project);
            }
        }

        return reject(new Error("You should provide a project template file (aepx) as an asset."));
    });
};
