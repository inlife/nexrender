const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const { expandEnvironmentVariables, checkForWSL } = require('../helpers/path')

const progressRegex = /([\d]{1,2}:[\d]{2}:[\d]{2}:[\d]{2})\s+(\(\d+[UL]?\))/gi;
const durationRegex = /Duration:\s+([\d]{1,2}:[\d]{2}:[\d]{2}:[\d]{2})/gi;
const startRegex = /Start:\s+([\d]{1,2}:[\d]{2}:[\d]{2}:[\d]{2})/gi;
const nexrenderErrorRegex = /Error:\s+(nexrender:.*)$/gim;
const errorRegex = /aerender Error:\s*(.*)$/gis;

const option = (params, name, ...values) => {
    if (values !== undefined) {
        values.every(value => value !== undefined) ? params.push(name, ...values) : undefined
    }
}

const seconds = (string) => string.split(':')
    .map((e, i) => (i < 3) ? +e * Math.pow(60, 2 - i) : +e * 10e-6)
    .reduce((acc, val) => acc + val);

const crossPlatformKill = (instance) => {
    if (process.platform === 'win32') {
        // kill the aerender process and all its children
        spawn('taskkill', ['/pid', instance.pid, '/f', '/t']);
    } else {
        instance.kill('SIGINT');
    }
}

/**
 * This task creates rendering process
 */
module.exports = (job, settings) => {
    settings.logger.log(`[${job.uid}] rendering job...`);

    // create container for our parameters
    let params = [];
    let outputFile = expandEnvironmentVariables(job.output)
    let projectFile = expandEnvironmentVariables(job.template.dest)
    let logPath = path.resolve(job.workpath, `../aerender-${job.uid}.log`)

    if (process.env.NEXRENDER_ENABLE_AELOG_PROJECT_FOLDER) {
        logPath = path.join(job.workpath, `aerender.log`)
        settings.logger.log(`[${job.uid}] setting aerender log path to project folder: ${logPath}`);
    } else if (process.env.NEXRENDER_ENABLE_AELOG_LEGACY_TEMP_FOLDER) {
        settings.logger.log(`[${job.uid}] setting aerender log path to temp folder: ${logPath}`);
    } else {
        settings.logger.log(`[${job.uid}] -- D E P R E C A T I O N: --

nexrender is changing the default aerender log path to the project folder.
This is done to streamline the log management and enable efficient log cleanup.

If you want to keep the old behavior and mute this message, please set the environment variable NEXRENDER_ENABLE_AELOG_LEGACY_TEMP_FOLDER to true.
If you want to switch to the new behavior, please set the environment variable NEXRENDER_ENABLE_AELOG_PROJECT_FOLDER to true.

Right now, the old behavior is still the default, but this will change in the next minor releases.
Estimated date of change to the new behavior: 2023-06-01.\n`);
    }

    const outputFileAE = checkForWSL(outputFile, settings)
    projectFile = checkForWSL(projectFile, settings)
    let jobScriptFile = checkForWSL(job.scriptfile, settings)

    // setup parameters
    params.push('-project', projectFile);
    params.push('-comp', job.template.composition);
    params.push('-output', outputFileAE);

    if (!settings.skipRender) {
        option(params, '-OMtemplate', job.template.outputModule);
        option(params, '-RStemplate', job.template.settingsTemplate);

        option(params, '-renderSettings', job.template.renderSettings);
        option(params, '-outputSettings', job.template.outputSettings);

        option(params, '-s', job.template.frameStart);
        option(params, '-e', job.template.frameEnd);
        option(params, '-i', job.template.incrementFrame);
    } else {
        option(params, '-s', 1);
        option(params, '-e', 1);
    }

    option(params, '-r', jobScriptFile);

    if (!settings.skipRender && settings.multiFrames) {
        const afterEffects = path.dirname(settings.binary)
        const afterEffectsYearMatch = afterEffects.match(/(20[0-9]{2})/);

        if (afterEffectsYearMatch && afterEffectsYearMatch[0] >= "2022") {
            params.push('-mfr', 'ON', settings.multiFramesCPU);
        } else {
            params.push('-mp');
        }
    }
    if (settings.reuse) params.push('-reuse');
    if (job.template.continueOnMissing) params.push('-continueOnMissingFootage')

    if (settings.imageCachePercent || settings.maxMemoryPercent) {
        option(params, '-mem_usage', settings.imageCachePercent || 50, settings.maxMemoryPercent || 50);
    }

    if (settings['aeParams']) {
        for (const param of settings['aeParams']) {
            let ps = param.split(" ");

            if (ps.length > 0) {
                params.push('-' + ps[0])
                params.push(...ps.slice(1))
            }
        }
    }

    // tracks progress
    let projectDuration = null;
    let currentProgress = null;
    let previousProgress = undefined;
    let renderStopwatch = null;
    let projectStart = null;

    // tracks error
    let errorSent = false;

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

        // look for error from nexrender.jsx
        // or maybe it has more global aerender error
        const matchNexrenderError = nexrenderErrorRegex.exec(string);
        const matchError = matchNexrenderError ? matchNexrenderError : errorRegex.exec(string);

        // There will be multiple error messages parsed when nexrender throws an error,
        // but we want only the first
        if (matchError !== null && !errorSent) {
            settings.logger.log(`[${job.uid}] rendering reached an error: ${matchError[1]}`);
            if (job.hasOwnProperty('onRenderError') && typeof job['onRenderError'] == 'function') {
                job.onRenderError(job, new Error(matchError[1]));
            }
            errorSent = true
        }

        return data;
    }

    settings.track('Job Render Started', {
        job_id: job.uid, // anonymized internally
        job_output_module: job.template.outputModule,
        job_settings_template: job.template.settingsTemplate,
        job_output_settings: job.template.outputSettings,
        job_render_settings: job.template.renderSettings,
        job_frame_start_set: job.template.frameStart !== undefined,
        job_frame_end_set: job.template.frameEnd !== undefined,
        job_frame_increment_set: job.template.frameIncrement !== undefined,
        job_continue_on_missing: job.template.continueOnMissing,
        job_image_sequence: job.template.imageSequence,
        job_multi_frames: settings.multiFrames,
        job_settings_reuse: settings.reuse,
        job_settings_skip_render: settings.skipRender,
        job_settings_stop_on_error: settings.stopOnError,
        job_settings_skip_cleanup: settings.skipCleanup,
        job_settings_max_memory_percent: !!settings.maxMemoryPercent,
        job_settings_image_cache_percent: !!settings.imageCachePercent,
        job_settings_aeparams_set: !!settings['aeParams'],
        job_settings_max_render_timeout: settings.maxRenderTimeout,
    })

    // spawn process and begin rendering
    return new Promise((resolve, reject) => {
        renderStopwatch = Date.now();

        let timeoutID = 0;
        let updateTimeout = 0;
        let updateTimeoutInterval = null;

        if (settings.debug) {
            settings.logger.log(`[${job.uid}] spawning aerender process: ${settings.binary} ${params.join(' ')}`);
        }

        const output = [];
        const instance = spawn(settings.binary, params, {
            windowsHide: true
            // NOTE: disabled PATH for now, there were a few
            // issues related to plugins not working properly
            // env: { PATH: path.dirname(settings.binary) },
        });

        instance.on('error', err => {
            clearTimeout(timeoutID);
            clearInterval(updateTimeoutInterval);
            settings.trackSync('Job Render Failed', { job_id: job.uid, error: 'aerender_spawn_error' });
            return reject(new Error(`Error starting aerender process: ${err}`));
        });

        instance.stdout.on('data', (data) => {
            output.push(parse(data.toString('utf8')));
            (settings.verbose && settings.logger.log(data.toString('utf8')));
            updateTimeout = Date.now()
        });

        instance.stderr.on('data', (data) => {
            output.push(data.toString('utf8'));
            (settings.verbose && settings.logger.log(data.toString('utf8')));
            updateTimeout = Date.now()
        });

        updateTimeoutInterval = setInterval(() => {
            if (projectStart === null) return;

            const now = Date.now()
            if (now - updateTimeout > settings.maxUpdateTimeout * 1000) {
                clearInterval(updateTimeoutInterval);
                clearTimeout(timeoutID);
                settings.trackSync('Job Render Failed', { job_id: job.uid, error: 'aerender_no_update' });
                reject(new Error(`No update from aerender for ${settings.maxUpdateTimeout} seconds`));
                crossPlatformKill(instance)
            }
        }, 5000)

        if (settings.maxRenderTimeout && settings.maxRenderTimeout > 0) {
            const timeout = 1000 * settings.maxRenderTimeout;
            timeoutID = setTimeout(
                () => {
                    clearInterval(updateTimeoutInterval);
                    clearTimeout(timeoutID);
                    settings.trackSync('Job Render Failed', { job_id: job.uid, error: 'aerender_timeout' });
                    reject(new Error(`Maximum rendering time exceeded`));
                    crossPlatformKill(instance)
                },
                timeout
            );
        }

        /* on finish (code 0 - success, other - error) */
        instance.on('close', (code) => {

            const outputStr = output
                .map(a => '' + a).join('');

            if (code !== 0 && settings.stopOnError) {
                if (fs.existsSync(logPath)) {
                    settings.logger.log(`[${job.uid}] dumping aerender log:`)
                    settings.logger.log(fs.readFileSync(logPath, 'utf8'))
                }

                settings.trackSync('Job Render Failed', {
                    job_id: job.uid, // anonymized internally
                    exit_code: code,
                    error: 'aerender_exit_code',
                });

                clearInterval(updateTimeoutInterval);
                clearTimeout(timeoutID);
                return reject(new Error(outputStr || 'aerender.exe failed to render the output into the file due to an unknown reason'));
            }

            const renderTime = (Date.now() - renderStopwatch) / 1000
            settings.logger.log(`[${job.uid}] rendering took ~${renderTime} sec.`);
            settings.logger.log(`[${job.uid}] writing aerender job log to: ${logPath}`);

            fs.writeFileSync(logPath, outputStr);

            /* resolve job without checking if file exists, or its size for image sequences */
            if (settings.skipRender || job.template.imageSequence || ['jpeg', 'jpg', 'png', 'tif', 'tga'].indexOf(outputFile) !== -1) {
                settings.track('Job Render Finished', {
                    job_id: job.uid, // anonymized internally
                    job_finish_reason: 'skipped_check',
                    job_render_time: renderTime,
                })

                clearInterval(updateTimeoutInterval);
                clearTimeout(timeoutID);
                return resolve(job)
            }

            // When a render has finished, look for a .mov file too, on AE 2022
            // the outputfile appears to be forced as .mov.
            // We need to maintain this here while we have 2022 and 2020
            // workers simultaneously

            const defaultOutputs = [
                job.output,
                job.output.replace(/\.avi$/g, '.mov'),
                job.output.replace(/\.avi$/g, '.mp4'),
                job.output.replace(/\.mov$/g, '.avi'),
                job.output.replace(/\.mov$/g, '.mp4'),
            ]

            while (!fs.existsSync(defaultOutputs[0]) && defaultOutputs.length > 0) {
                defaultOutputs.shift();
            }

            if (defaultOutputs.length === 0 || !fs.existsSync(defaultOutputs[0])) {
                if (fs.existsSync(logPath)) {
                    settings.logger.log(`[${job.uid}] dumping aerender log:`)
                    settings.logger.log(fs.readFileSync(logPath, 'utf8'))
                }

                settings.trackSync('Job Render Failed', { job_id: job.uid, error: 'aerender_output_not_found' });
                clearTimeout(timeoutID);
                clearInterval(updateTimeoutInterval);
                return reject(new Error(`Couldn't find a result file: ${outputFile}`))
            }

            job.output = defaultOutputs[0];
            const stats = fs.statSync(job.output)

            /* file smaller than 1000 bytes */
            if (stats.size < 1000) {
                settings.logger.log(`[${job.uid}] Warning: output file size is less than 1000 bytes (${stats.size} bytes), be advised that file is corrupted, or rendering is still being finished`)
            }

            settings.track('Job Render Finished', {
                job_id: job.uid, // anonymized internally
                job_finish_reason: 'success',
                job_render_time: renderTime,
            });

            clearTimeout(timeoutID);
            clearInterval(updateTimeoutInterval);
            resolve(job)
        });

        if (settings.onInstanceSpawn) {
            settings.onInstanceSpawn(instance, job, settings)
        }
    })
};

