'use strict';

const fs        = require('fs-extra');
const path      = require('path');
const async     = require('async');

/**
 * Clean up all workpath files and remove folder
 */
module.exports = function(project) {
    return new Promise((resolve, reject) => {

        console.log(`[${project.uid}] cleaning up...`);

        fs.remove( project.workpath, (err) => {
            return (err) ? reject(err) : resolve(project);
        })
    });
};
