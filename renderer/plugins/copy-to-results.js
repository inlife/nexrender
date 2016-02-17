'use strict';

const mkdirp    = require('mkdirp');
const path      = require('path');
const fs        = require('fs-extra');

const RESULTS_DIR = process.env.RESULTS_DIR || 'results';

module.exports = {
    name: 'copy-to-results',
    plugin: (project, action, callback) => {

        let src = path.join( project.workpath, project.resultname );
        let dst = path.join( RESULTS_DIR, project.uid + '_' + project.resultname );

        // create, if it does not exists
        mkdirp.sync(RESULTS_DIR);

        // send success
        fs.move(src, dst, callback);
    }
};
