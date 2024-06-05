'use strict';

const fs           = require('fs')
const os           = require('os')
const path         = require('path')

const isWsl        = require('is-wsl')

const license      = require('./helpers/license')
const autofind     = require('./helpers/autofind')
const patch        = require('./helpers/patch')
const state        = require('./helpers/state')
const filterAndSortJobs = require('./helpers/filter-and-sort-jobs')

const setup        = require('./tasks/setup')
const predownload  = require('./tasks/actions')('predownload')
const download     = require('./tasks/download')
const postdownload = require('./tasks/actions')('postdownload')
const prerender    = require('./tasks/actions')('prerender')
const script       = require('./tasks/script')
const dorender     = require('./tasks/render')
const postrender   = require('./tasks/actions')('postrender')
const cleanup      = require('./tasks/cleanup')

/* place to register all plugins */
/* so they will be picked up and resolved by pkg */
if (process.env.NEXRENDER_REQUIRE_PLUGINS) {
    require('@create-global/nexrender-action-copy');
    require('@create-global/nexrender-action-encode');
    require('@create-global/nexrender-action-upload');

    require('@create-global/nexrender-provider-s3');
    require('@create-global/nexrender-provider-ftp');
    require('@create-global/nexrender-provider-gs');
    require('@create-global/nexrender-provider-sftp');
}

//
// https://video.stackexchange.com/questions/16706/rendered-file-with-after-effects-is-very-huge
//

const init = (settings) => {
    settings = Object.assign({}, settings);
    settings.logger = settings.logger || console;

    // check for WSL
    settings.wsl = isWsl

    const binaryAuto = autofind(settings);
    const binaryUser = settings.binary && fs.existsSync(settings.binary) ? settings.binary : null;

    if (!binaryUser && !binaryAuto) {
        throw new Error('you should provide a proper path to After Effects\' "aerender" binary')
    }

    if (binaryAuto && !binaryUser) {
        settings.logger.log('using automatically determined directory of After Effects installation:')
        settings.logger.log(' - ' + binaryAuto)
    }

    settings = Object.assign({
        workpath: path.join(os.tmpdir(), 'nexrender'),

        addLicense: false,
        forceCommandLinePatch: false,
        skipCleanup: false,
        skipRender: false,
        stopOnError: true,

        debug: false,
        multiFrames: false,
        multiFramesCPU: 90,
        maxMemoryPercent: undefined,
        imageCachePercent: undefined,
        wslMap: undefined,

        onInstanceSpawn: undefined,

        __initialized: true,
    }, settings, {
        binary: binaryUser || binaryAuto,
    })

    // make sure we will have absolute path
    if (!path.isAbsolute(settings.workpath)) {
        settings.workpath = path.join(process.cwd(), settings.workpath);
    }

    // if WSL, ask user to define Mapping
    if (settings.wsl && !settings.wslMap)
        throw new Error('WSL detected: provide your WSL drive map; ie. "Z"')


    // add license helper
    if (settings.addLicense) {
        license(settings);
    }

    // attempt to patch the default
    // Scripts/commandLineRenderer.jsx
    patch(settings);

    return settings;
}


const render = (job, settings = {}, updateJob) => {
    if (!settings.__initialized) {
        settings = init(settings)
    }

    return Promise.resolve(job)
        .then(job => state(job, settings, updateJob, setup, 'setup'))
        .then(job => state(job, settings, updateJob, predownload, 'predownload'))
        .then(job => state(job, settings, updateJob, download, 'download'))
        .then(job => state(job, settings, updateJob, postdownload, 'postdownload'))
        .then(job => state(job, settings, updateJob, prerender, 'prerender'))
        .then(job => state(job, settings, updateJob, script, 'script'))
        .then(job => state(job, settings, updateJob, dorender, 'dorender'))
        .then(job => state(job, settings, updateJob, postrender, 'postrender'))
        .then(job => state(job, settings, updateJob, cleanup, 'cleanup'))
        .catch(e => {
            state(job, settings, updateJob, cleanup, 'cleanup');
            throw e;
        });
};

module.exports = {
    init,
    render,
    filterAndSortJobs
}
