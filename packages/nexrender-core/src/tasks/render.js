'use strict';

const path  = require('path')
const spawn = require('child_process').spawn

const progressRegex = /([\d]{1,2}:[\d]{2}:[\d]{2}:[\d]{2})\s+(\(\d+\))/gi;
const durationRegex = /Duration:\s+([\d]{1,2}:[\d]{2}:[\d]{2}:[\d]{2})/gi;

const option  = (params, name, value) => value ? params.push(name, value) : undefined
const seconds = (string) => string.split(':')
    .map((e, i) => (i < 3) ? +e * Math.pow(60, 2 - i) : +e * 10e-6)
    .reduce((acc, val) => acc + val);

/**
 * This task creates rendering process
 */
module.exports = (job, settings) => {
    if (settings.logger) settings.logger.log(`[${job.uid}] rendering job...`);

    // create container for our parameters
    let params = [];

    // setup parameters
    option(params, '-comp',    job.template.composition);
    option(params, '-project', path.join(job.workpath, path.basename(job.template.src)));
    option(params, '-output',  path.join(job.workpath, job.resultname));

    option(params, '-OMtemplate', job.template.outputModule);
    option(params, '-RStemplate', job.settings.settingsTemplate);
    option(params, '-s', job.settings.frameStart);
    option(params, '-e', job.settings.endFrame);
    option(params, '-i', job.settings.incrementFrame);
    option(params, '-mp', settings.multiFrames);
    // option(params, '-log', settings.log);

    if (settings.imageCachePercent || settings.maxMemoryPercent) {
        option(params, '-mem_usage', `${settings.imageCachePercent || 50} ${settings.maxMemoryPercent || 50}`)
    }

    // tracks progress
    let projectDuration = null;
    let currentProgress = null;

    const parse = (data, prefix) => {
        const string = (''+data).replace(/;/g, ':'); /* sanitize string */

        // Only execute durationRegex if project duration hasnt been found
        const matchDuration = isNaN(parseInt(projectDuration)) ? durationRegex.exec(s) : false;
        // Only execute progressRegex if project duration has been found
        const matchProgress = !isNaN(parseInt(projectDuration)) ? progressRegex.exec(s) : null;
        // If durationRegex has a match convert tstamp to seconds and define projectDuration only once
        projectDuration = (matchDuration) ? seconds(matchDuration[1]) : projectDuration;

        if (matchProgress) {
            currentProgress = Math.ceil(seconds(matchProgress[1]) * 100 / projectDuration);
            if (settings.logger) settings.logger.log(`[${job.uid}] rendering progress ${currentProgress}%...`);
        }

        return data;
    }

    // spawn process and begin rendering
    return new Promise((resolve, reject) => {
        const instance = spawn(settings.binary, params);
        const output = [];

        instance.on('error', err => reject(new Error(`Error starting aerender process: ${err}`)));
        instance.stdout.on('data', (data) => output.push(parse(data)));
        instance.stderr.on('data', (data) => output.push(data));

        /* on finish (code 0 - success, other - error) */
        instance.on('close', (code) => (code !== 0) ? reject(output.map(a => ''+a).join('')) : resolve(job));
    })
};
