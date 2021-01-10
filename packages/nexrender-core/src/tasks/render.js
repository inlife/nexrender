const fs = require('fs')
const path = require('path')
const {spawn} = require('child_process')
const {expandEnvironmentVariables, checkForWSL} = require('../helpers/path')

const progressRegex = /([\d]{1,2}:[\d]{2}:[\d]{2}:[\d]{2})\s+(\(\d+\))/gi;
const durationRegex = /Duration:\s+([\d]{1,2}:[\d]{2}:[\d]{2}:[\d]{2})/gi;
const startRegex = /Start:\s+([\d]{1,2}:[\d]{2}:[\d]{2}:[\d]{2})/gi;

const option = (params, name, ...values) => {
    if (values !== undefined) {
        values.every(value => value !== undefined) ? params.push(name, ...values) : undefined
    }
}
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
    let outputFile = expandEnvironmentVariables(job.output)
    let projectFile = expandEnvironmentVariables(job.template.dest)

    outputFileAE = checkForWSL(outputFile, settings)
    projectFile = checkForWSL(projectFile, settings)
    let jobScriptFile = checkForWSL(job.scriptfile, settings)


    // setup parameters
    params.push('-project', projectFile);
    params.push('-comp', job.template.composition);
    params.push('-output', outputFileAE);

    if (!settings.skipRender){

        option(params, '-OMtemplate', job.template.outputModule);
        option(params, '-RStemplate', job.template.settingsTemplate);

        option(params, '-s', job.template.frameStart);
        option(params, '-e', job.template.frameEnd);
        option(params, '-i', job.template.incrementFrame);
    } else {
        option(params, '-s', 1);
        option(params, '-e', 1);
    }

    option(params, '-r', jobScriptFile);

    if (!settings.skipRender && settings.multiFrames) params.push('-mp');
    if (settings.reuse) params.push('-reuse');
    if (job.template.continueOnMissing) params.push('-continueOnMissingFootage')

    if (settings.imageCachePercent || settings.maxMemoryPercent) {
        option(params, '-mem_usage', settings.imageCachePercent || 50, settings.maxMemoryPercent || 50);
    }

    if (settings['aeParams']) {
        for (param of settings['aeParams']) {
            let ps = param.split(" ");

            if (ps.length > 0) {
                params.push('-' + ps[0])
            }

            if (ps.length > 1) {
                params.push(ps[1])
            }
        }
    }


    // tracks progress
    let projectDuration = null;
    let currentProgress = null;
    let previousProgress = undefined;
    let renderStopwatch = null;
    let projectStart = null;

    const parse = (data) => {
        const string = ('' + data).replace(/;/g, ':'); /* sanitize string */

        // Only execute startRegex if project start hasnt been found
        const matchStart = isNaN(parseInt(projectStart)) ? startRegex.exec(string) : false;
        // Only execute durationRegex if project duration hasnt been found
        const matchDuration = isNaN(parseInt(projectDuration)) ? durationRegex.exec(string) : false;
        // Only execute progressRegex if project duration has been found
        const matchProgress = !isNaN(parseInt(projectDuration)) ? progressRegex.exec(string) : null;
        // If durationRegex has a match convert tstamp to seconds and define projectDuration only once
        projectDuration = (matchDuration) ? seconds(matchDuration[1]) : projectDuration;
        // If startRegex has a match convert tstamp to seconds and define projectStart only once
        projectStart = (matchStart) ? seconds(matchStart[1]) : projectStart;

        if (matchProgress) {
            currentProgress = Math.ceil((seconds(matchProgress[1]) - projectStart) * 100 / projectDuration);

            if (previousProgress !== currentProgress) {
                settings.logger.log(`[${job.uid}] rendering progress ${currentProgress}%...`);
                previousProgress = currentProgress;
                job.renderProgress = currentProgress;

                if (job.hasOwnProperty('onRenderProgress') && typeof job['onRenderProgress'] == 'function') {
                    job.onRenderProgress(job, job.renderProgress);
                }
            }
        }

        return data;
    }

    // spawn process and begin rendering
    return new Promise((resolve, reject) => {
        renderStopwatch = Date.now();

        if (settings.debug) {
            settings.logger.log(`[${job.uid}] spawning aerender process: ${settings.binary} ${params.join(' ')}`);
        }

        const output = [];
        const logPath = path.resolve(job.workpath, `../aerender-${job.uid}.log`)
        const instance = spawn(settings.binary, params, {
            // NOTE: disabled PATH for now, there were a few
            // issues related to plugins not working properly
            // env: { PATH: path.dirname(settings.binary) },
        });

        instance.on('error', err => reject(new Error(`Error starting aerender process: ${err}`)));
        instance.stdout.on('data', (data) => {
            output.push(parse(data.toString('utf8')));
            (settings.verbose && settings.logger.log(data.toString('utf8')));
        });
        instance.stderr.on('data', (data) => {
            output.push(data.toString('utf8'));
            (settings.verbose && settings.logger.log(data.toString('utf8')));
        });

        /* on finish (code 0 - success, other - error) */
        instance.on('close', (code) => {

            const outputStr = output
                .map(a => '' + a).join('');

            if (code !== 0 && settings.stopOnError) {
                if (fs.existsSync(logPath)) {
                    settings.logger.log(`[${job.uid}] dumping aerender log:`)
                    settings.logger.log(fs.readFileSync(logPath, 'utf8'))
                }

                return reject(new Error(outputStr || 'aerender.exe failed to render the output into the file due to an unknown reason'));
            }

            settings.logger.log(`[${job.uid}] rendering took ~${(Date.now() - renderStopwatch) / 1000} sec.`);
            settings.logger.log(`[${job.uid}] writing aerender job log to: ${logPath}`);

            fs.writeFileSync(logPath, outputStr);

            /* resolve job without checking if file exists, or its size for image sequences */
            if (settings.skipRender || job.template.imageSequence || ['jpeg', 'jpg', 'png'].indexOf(outputFile) !== -1) {
                return resolve(job)
            }

            if (!fs.existsSync(outputFile)) {
                if (fs.existsSync(logPath)) {
                    settings.logger.log(`[${job.uid}] dumping aerender log:`)
                    settings.logger.log(fs.readFileSync(logPath, 'utf8'))
                }

                return reject(new Error(`Couldn't find a result file: ${outputFile}`))
            }

            const stats = fs.statSync(outputFile)

            /* file smaller than 1000 bytes */
            if (stats.size < 1000) {
                settings.logger.log(`[${job.uid}] Warning: output file size is less than 1000 bytes (${stats.size} bytes), be advised that file is corrupted, or rendering is still being finished`)
            }

            resolve(job)
        });
    })
};

