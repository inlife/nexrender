'use strict';

const fs    = require('fs')
const path  = require('path')
const spawn = require('child_process').spawn

const progressRegex = /([\d]{1,2}:[\d]{2}:[\d]{2}:[\d]{2})\s+(\(\d+\))/gi;
const durationRegex = /Duration:\s+([\d]{1,2}:[\d]{2}:[\d]{2}:[\d]{2})/gi;

const option  = (params, name, value) => value !== undefined ? params.push(name, value) : undefined
const seconds = (string) => string.split(':')
    .map((e, i) => (i < 3) ? +e * Math.pow(60, 2 - i) : +e * 10e-6)
    .reduce((acc, val) => acc + val);

/**
 * This task creates rendering process
 */
module.exports = (job, settings) => {
    settings.logger.log(`[${job.uid}] rendering job...`);

    // create container for our parameters
    let params = [];

    // setup parameters
    params.push('-comp',    job.template.composition);
    params.push('-project', path.join(job.workpath, path.basename(job.template.src)));
    params.push('-output',  path.join(job.workpath, job.resultname));

    option(params, '-OMtemplate', job.template.outputModule);
    option(params, '-RStemplate', job.template.settingsTemplate);
    option(params, '-s', job.template.frameStart);
    option(params, '-e', job.template.frameEnd);
    option(params, '-i', job.template.incrementFrame);
    option(params, '-r', job.scriptfile);

    if (settings.multiFrames) params.push('-mp');
    // option(params, '-log', path.join(job.workpath, 'output.log'));

    if (settings.imageCachePercent || settings.maxMemoryPercent) {
        option(params, '-mem_usage', `${settings.imageCachePercent || 50} ${settings.maxMemoryPercent || 50}`)
    }

    // tracks progress
    let projectDuration  = null;
    let currentProgress  = null;
    let previousProgress = undefined;
    let renderStopwatch  = null;

    const parse = (data) => {
        const string = (''+data).replace(/;/g, ':'); /* sanitize string */

        // Only execute durationRegex if project duration hasnt been found
        const matchDuration = isNaN(parseInt(projectDuration)) ? durationRegex.exec(string) : false;
        // Only execute progressRegex if project duration has been found
        const matchProgress = !isNaN(parseInt(projectDuration)) ? progressRegex.exec(string) : null;
        // If durationRegex has a match convert tstamp to seconds and define projectDuration only once
        projectDuration = (matchDuration) ? seconds(matchDuration[1]) : projectDuration;

        if (matchProgress) {
            currentProgress = Math.ceil(seconds(matchProgress[1]) * 100 / projectDuration);

            if (previousProgress !== currentProgress) {
                settings.logger.log(`[${job.uid}] rendering progress ${currentProgress}%...`);
                previousProgress = currentProgress;
            }
        }

        return data;
    }

    // spawn process and begin rendering
    return new Promise((resolve, reject) => {
        renderStopwatch = Date.now();

        const instance = spawn(settings.binary, params);
        const output = [];

        instance.on('error', err => reject(new Error(`Error starting aerender process: ${err}`)));
        instance.stdout.on('data', (data) => output.push(parse(data.toString('utf8'))));
        instance.stderr.on('data', (data) => output.push(data.toString('utf8')));

        /* on finish (code 0 - success, other - error) */
        instance.on('close', (code) => {
            const outputStr = output
                .map(a => ''+a)
                .join('\n');

            if (code !== 0) {
                return reject()
            }

            if (settings.renderLogs) {
                const logPath = path.resolve(job.workpath, '..', `${job.uid}-aerender.log`)
                settings.logger.log(`[${job.uid}] writing aerender job log to: ${logPath}`);
                fs.writeFileSync(logPath, outputStr);
            }

            settings.logger.log(`[${job.uid}] rendering took ~${(Date.now() - renderStopwatch)/1000} sec.`);
            resolve(job)
        });
    })
};
