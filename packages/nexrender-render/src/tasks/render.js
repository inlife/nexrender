'use strict';

const path  = require('path')
const spawn = require('child_process').spawn

/**
 * This task creates rendering process
 */
module.exports = function(project, settings) {
    return new Promise((resolve, reject) => {
        if (settings.logger) settings.logger(`[${project.uid}] rendering project...`);

        // create container for data and parameters
        let aedata = [];
        let params = [];

        // setup parameters
        params.push('-comp',        project.composition);
        params.push('-project',     path.join(project.workpath, project.template));
        params.push('-output',      path.join(project.workpath, project.resultname));

        // advanced parameters
        if (project.settings) {
            if (project.settings.outputModule) {
                params.push('-OMtemplate', project.settings.outputModule);
            }

            if (project.settings.renderSettings) {
                params.push('-RStemplate', project.settings.renderSettings);
            }

            if (project.settings.startFrame) {
                params.push('-s', project.settings.startFrame);
            }

            if (project.settings.endFrame) {
                params.push('-e', project.settings.endFrame);
            }

            if (project.settings.incrementFrame) {
                params.push('-i', project.settings.incrementFrame);
            }
        }

        if (settings.multiframes) {
            params.push('-mp');
        }

        if (settings.log && settings.log.length > 0) {
            params.push('-log', settings.log);
        }

        if (settings.memory && settings.memory.length > 0) {
            // if mem_usage have wrong format
            if (settings.memory.indexOf(' ') === -1) {
                return reject( new Error('Wrong memory format') );
            }

            // split by space and prase int's
            let memcomps = settings.memory.split(' ');
            let image_cache_percent = parseInt(memcomps[0]) || 50;
            let max_mem_percent     = parseInt(memcomps[1]) || 50;

            // pass params
            params.push('-mem_usage', image_cache_percent, max_mem_percent);
        }

        // spawn process and begin rendering
        let ae = spawn(settings.binary, params);

        ae.on('error', (err) => {
            return reject(new Error('Error starting aerender process, did you set up the path correctly?'));
        });

        // on data (logs)
        ae.stdout.on('data', (data) => {
            aedata.push(data.toString());
        });

        // on error (logs)
        ae.stderr.on('data', (data) => {
            aedata.push(data.toString());
        });

        // on finish (code 0 - success, other - error)
        ae.on('close', (code) => {
            return (code !== 0) ? reject(aedata.join('')) : resolve(project);
        });
    });
};
