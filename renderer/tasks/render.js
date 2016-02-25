'use strict';

const spawn = require('child_process').spawn;
const path  = require('path');

/**
 * This task creates rendering process
 */
module.exports = function(project) {
    return new Promise((resolve, reject) => {

        console.info(`[${project.uid}] rendering project...`);

        // create container for data and parameters
        let aedata = [];
        let params = [];

        let outext = (project.settings && project.settings.outputExt) ? project.settings.outputExt : 'mp4';

        project.resultname = 'result' + '.' + outext;

        // setup parameters
        params.push('-comp',        project.composition);
        params.push('-project',     path.join( process.cwd(), project.workpath, project.template ));
        params.push('-output',      path.join( process.cwd(), project.workpath, project.resultname ));

        // advanced parameters
        if (project.settings) {

            if (process.env.AE_MEMORY && process.env.AE_MEMORY.length > 0) {

                // if mem_usage have wrong format
                if (process.env.AE_MEMORY.indexOf(' ') === -1) {
                    return reject(new Error('Memory setting must look like --mem=\"50 50\". \
Details: https://helpx.adobe.com/after-effects/using/automated-rendering-network-rendering.html'));
                }

                // split by space and prase int's
                let memcomps = process.env.AE_MEMORY.split(' ');
                let image_cache_percent = parseInt(memcomps[0]) || 50;
                let max_mem_percent     = parseInt(memcomps[1]) || 50;

                // pass params
                params.push('-mem_usage', image_cache_percent, max_mem_percent);
            }

            if (project.settings.outputModule)
                params.push('-OMtemplate', project.settings.outputModule);

            if (project.settings.startFrame)
                params.push('-s', project.settings.startFrame);

            if (project.settings.endFrame)
                params.push('-e', project.settings.endFrame);

            if (process.env.AE_MULTIFRAMES)
                params.push('-mp');

        }

        // spawn process and begin rendering
        let ae = spawn(process.env.AE_BINARY, params);

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
            return (code != 0) ? reject( aedata.join('') ) : resolve( project );
        });
    });
};
