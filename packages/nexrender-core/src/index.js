'use strict';

const fs         = require('fs')
const os         = require('os')
const path       = require('path')

const license    = require('./helpers/license')
const autofind   = require('./helpers/autofind')
const patch      = require('./helpers/patch')
const state      = require('./helpers/state')

const setup      = require('./tasks/setup')
const download   = require('./tasks/download')
const prerender  = require('./tasks/actions')('prerender')
const script     = require('./tasks/script')
const dorender   = require('./tasks/render')
const postrender = require('./tasks/actions')('postrender')
const cleanup    = require('./tasks/cleanup')

/* place to register all plugins */
/* so they will be picked up and resolved by pkg */
if (process.env.NEXRENDER_REQUIRE_PLUGINS) {
    require('@nexrender/action-copy');
    require('@nexrender/action-encode');
    require('@nexrender/action-upload');

    require('@nexrender/provider-s3');
    require('@nexrender/provider-ftp');
}

//
// https://video.stackexchange.com/questions/16706/rendered-file-with-after-effects-is-very-huge
//

const init = (settings) => {
    settings = Object.assign({}, settings);
    settings.logger = settings.logger || { log: function() {} };

    const binaryAuto = autofind(settings);
    const binaryUser = settings.binary && fs.existsSync(settings.binary) ? settings.binary : null;

    if (!binaryUser && !binaryAuto) {
        throw new Error('you should provide a proper path to After Effects\' \"aerender\" binary')
    }

    if (binaryAuto && !binaryUser) {
        settings.logger.log('using automatically determined directory of After Effects installation:')
        settings.logger.log(' - ' + binaryAuto)
    }

    settings = Object.assign({
        workpath: path.join(os.tmpdir(), 'nexrender'),

        addLicense: true,
        forceCommandLinePatch: false,
        skipCleanup: false,
        stopOnError: true,

        debug: false,
        multiFrames: false,
        maxMemoryPercent: undefined,
        imageCachePercent: undefined,
    }, settings, {
        binary: binaryUser || binaryAuto,
    })

    // make sure we will have absolute path
    if (!path.isAbsolute(settings.workpath)) {
        settings.workpath = path.join(process.cwd(), settings.workpath);
    }

    // add license helper
    if (settings.addLicense) {
        license(settings);
    }

    // attempt to patch the default
    // Scripts/commandLineRenderer.jsx
    patch(settings);

    return settings;
}


const render = (job, settings) => {
    return Promise.resolve(job)
        .then(job => state(job, settings, setup, 'setup'))
        .then(job => state(job, settings, download, 'download'))
        .then(job => state(job, settings, prerender, 'prerender'))
        .then(job => state(job, settings, script, 'script'))
        .then(job => state(job, settings, dorender, 'dorender'))
        .then(job => state(job, settings, postrender, 'postrender'))
        .then(job => state(job, settings, cleanup, 'cleanup'))
}

module.exports = { init, render }
