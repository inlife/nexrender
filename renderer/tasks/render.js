'use strict';

const child_process = require('child_process');
const path          = require('path');

// add ability to override
let spawn = child_process.spawn;

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

        // set default project result file name
        project.resultname = 'result' + '.' + outext;

        // NOTE: for still (jpg) image sequence frame filename will be changed to result_[#####].jpg
        // NOTE: if you want to change this field, also goto actions/copy-to-results.js, and apply changes there too
        if (project.settings && 
            project.settings.outputExt && 
            ['jpeg', 'jpg'].indexOf( 
                project.settings.outputExt.toLowerCase() 
            ) !== -1
        ) {
            project.resultname = 'result_[#####]' + '.' + outext;
        }

        // setup parameters
        params.push('-comp',        project.composition);
        params.push('-project',     path.join( process.cwd(), project.workpath, project.template ));
        params.push('-output',      path.join( process.cwd(), project.workpath, project.resultname ));

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

        if (process.env.AE_MULTIFRAMES){
            params.push('-mp');
        }

        if (process.env.AE_MEMORY && process.env.AE_MEMORY.length > 0) {

            // if mem_usage have wrong format
            if (process.env.AE_MEMORY.indexOf(' ') === -1) {
                return reject( new Error('Wrong memory format') );
            }

            // split by space and prase int's
            let memcomps = process.env.AE_MEMORY.split(' ');
            let image_cache_percent = parseInt(memcomps[0]) || 50;
            let max_mem_percent     = parseInt(memcomps[1]) || 50;

            // pass params
            params.push('-mem_usage', image_cache_percent, max_mem_percent);
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
            return (code !== 0) ? reject( aedata.join('') ) : resolve( project );
        });
    });
};
