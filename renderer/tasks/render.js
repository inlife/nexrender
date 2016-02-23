'use strict';

const spawn = require('child_process').spawn;
const path  = require('path');

/**
 * This task creates rendering process
 */
module.exports = function(project) {
    return new Promise((resolve, reject) => {

        console.log(`[${project.uid}] rendering project...`);

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

            if (project.settings.outputModule)
                params.push('-OMtemplate', project.settings.outputModule);

            if (project.settings.startFrame)
                params.push('-s', project.settings.startFrame);

            if (project.settings.endFrame)
                params.push('-e', project.settings.endFrame);

            if (process.env.AE_MULTIFRAMES)
                param.push('-mp');

            if (process.env.AE_MEMORY)
                param.push('-mem_usage', process.env.AE_MEMORY);
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
