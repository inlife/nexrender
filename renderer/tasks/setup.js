'use strict';

const mkdirp      = require('mkdirp');
const path        = require('path');
const fs          = require('fs-extra');

const TEMPLATES_DIRECTORY   = process.env.TEMPLATES_DIRECTORY   || "templates";
const TEMP_DIRECTORY        = process.env.TEMP_DIRECTORY        || "temp";

module.exports = function(project) {
    return new Promise((resolve, reject) => {

        console.log("setting up project...");

        // setup project's workpath
        project.workpath   = path.join(TEMP_DIRECTORY,      project.uid);

        // set template path && projectname
        let templatepath   = path.join(TEMPLATES_DIRECTORY, project.template);
        let workingProject = path.join(project.workpath,    project.template);

        // create, if it does not exists
        mkdirp.sync(project.workpath);

        // copy project file
        fs.copy(templatepath, workingProject, (err) => {
            return (err) ? reject(err) : resolve(project);
        });
    });
};