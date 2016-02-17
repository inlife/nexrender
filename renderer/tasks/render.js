'use strict';

const spawn = require('child_process').spawn;
const path  = require('path');

const AE_OUTPUTEXT  = (process.platform === 'darwin' ? '.mov' : process.env.AE_OUTPUTEXT || '.mp4');

/**
 * This task creates rendering process
 */
module.exports = function(project) {
    return new Promise((resolve, reject) => {

        console.log(`[${project.uid}] rendering project...`);

        // create container for data and parameters
        let aedata = [];
        let params = [];

        project.resultname = 'result' + AE_OUTPUTEXT;

        // setup parameters
        params.push('-comp',        project.composition);
        params.push('-project',     path.join( process.cwd(), project.workpath, project.template ));
        params.push('-output',      path.join( process.cwd(), project.workpath, project.resultname ));

        // advanced parameters
        if (project.settings) {

            if (project.settings.codec)
                params.push('-OMtemplate', project.settings.codec);

            if (project.settings.startframe)
                params.push('-s', project.settings.startframe);

            if (project.settings.endframe)
                params.push('-e', project.settings.endframe);
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
