'use strict'

const fs        = require('fs')

const license   = require('./helpers/license')
const autofind  = require('./helpers/autofind')

const setup     = require('./tasks/setup')
const download  = require('./tasks/download')
const patch     = require('./tasks/patch')
const render    = require('./tasks/render')
const verify    = require('./tasks/verify')
const actions   = require('./tasks/actions')
const cleanup   = require('./tasks/cleanup')

//
// https://video.stackexchange.com/questions/16706/rendered-file-with-after-effects-is-very-huge
//

module.exports = (job, settings) => {
    settings = Object.assign({}, settings);

    const binaryAuto = autofind(settings);
    const binaryUser = settings.binary && fs.existsSync(settings.binary) ? settings.binary : null;

    if (!binaryUser && !binaryAuto) {
        return Promise.reject(new Error('you should provide a proper path to After Effects\' \"aerender\" binary'))
    }

    settings.binary         = binaryUser            || binaryAuto;
    settings.workpath       = settings.workpath     || process.env.TEMP_DIRECTORY || './temp';
    settings.multiframes    = settings.multiframes  || false;
    settings.addlicense     = settings.addlicense   || false;
    settings.logger         = settings.logger       || () => {};
    settings.memory         = settings.memory       || '';
    settings.log            = settings.log          || '';

    settings.outputExt      = settings.outputExt.toLowerCase() || null;

    // make sure we will have absolute path
    if (!path.isAbsolute(settings.workpath)) {
        settings.workpath = path.join(process.cwd(), settings.workpath);
    }

    // add license helper
    if (settings.addlicense) {
        license(settings)
    }

    return Promise.resolve(job)
        .then(job => setup(job, settings))
        .then(job => download(job, settings))
        .then(job => patch(job, settings))
        .then(job => render(job, settings))
        .then(job => verify(job, settings))
        .then(job => actions(job, settings))
        .then(job => cleanup(job, settings))
}
