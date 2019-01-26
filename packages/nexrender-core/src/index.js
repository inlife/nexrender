'use strict';

const fs         = require('fs')
const os         = require('os')
const path       = require('path')

const license    = require('./helpers/license')
const autofind   = require('./helpers/autofind')
const patch      = require('./helpers/patch')

const setup      = require('./tasks/setup')
const download   = require('./tasks/download')
const prerender  = require('./tasks/actions')('prerender')
const script     = require('./tasks/script')
const render     = require('./tasks/render')
const postrender = require('./tasks/actions')('postrender')
const cleanup    = require('./tasks/cleanup')

//
// https://video.stackexchange.com/questions/16706/rendered-file-with-after-effects-is-very-huge
//

module.exports = (job, settings) => {
    settings = Object.assign({}, settings);
    settings.logger = settings.logger || { log: function() {} };

    const binaryAuto = autofind(settings);
    const binaryUser = settings.binary && fs.existsSync(settings.binary) ? settings.binary : null;

    if (!binaryUser && !binaryAuto) {
        return Promise.reject(new Error('you should provide a proper path to After Effects\' \"aerender\" binary'))
    }

    if (binaryAuto && !binaryUser) {
        settings.logger.log('using automatically determined directory of After Effects installation:')
        settings.logger.log(' - ' + binaryAuto)
    }

    settings = Object.assign({
        binary: binaryUser || binaryAuto,
        workpath: path.join(os.tmpdir(), 'nexrender'),

        addLicense: true,
        forceCommandLinePatch: false,

        multiFrames: false,
        maxMemoryPercent: undefined,
        imageCachePercent: undefined,
    }, settings)

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

    return Promise.resolve(job)
        .then(job => setup(job, settings))
        .then(job => download(job, settings))
        .then(job => prerender(job, settings))
        .then(job => script(job, settings))
        .then(job => render(job, settings))
        .then(job => postrender(job, settings))
        .then(job => cleanup(job, settings))
}
