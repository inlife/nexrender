#!/usr/bin/env node

'use strict';

const os        = require('os');
const cli       = require('cli').enable('version');
const nexrender = require('./index.js');

cli.parse({
    'aerender':     [false, 'PATH to aerender binary', 'path'],
    'api-server':   ['s', 'Start api server'],
    'renderer':     ['r', 'Start renderer'],
    'host':         ['h', 'Remote HOST:PORT to connect', 'host', 'localhost:3000'],
    'port':         ['p', 'Listen on port', 'port', 3000],
    'version':      ['v', 'Get version']
});

// Usage: 
// nexrender --renderer --host=localhost:3000 --aerender="/Applications/Adobe After Effects CC 2015/aerender"
//           -rh localhost:3000 --aerender="/Applications/Adobe After Effects CC 2015/aerender"
// nexrender --api-server --port=3000
//           -sp 3000

cli.main(function(args, options) {

    console.log(`
                                   | |          
 _ __   _____  ___ __ ___ _ __   __| | ___ _ __ 
| '_ \\ / _ \\ \\/ / '__/ _ \\ '_ \\ / _\` |/ _ \\ '__|
| | | |  __/>  <| | |  __/ | | | (_| |  __/ |   
|_| |_|\\___/_/\\_\\_|  \\___|_| |_|\\__,_|\\___|_|   
          
                  VERSION: ${nexrender.version} 
                   AUTHOR: Inlife                                    
    `);

    if (options.version) {
        return console.log('nexrender version:', nexrender.version)
    }

    if (options['api-server']) {
        nexrender.server.start(options.port);
    }

    if (options['renderer']) {
        if (['darwin', 'win32', 'win64'].indexOf( os.platform() ) == -1) {
            console.warn('[error] you might be considering to run renderer on officialy supported platform');
        }

        if (!options.aerender) {
            return console.error('[error] provide --aerender=PATH for aerender binary file');
        }

        let uri = options.host.split(':');

        nexrender.renderer.start({
            host: uri[0],
            port: uri[1],
            aerender: options.aerender
            /*platform specific settings*/
        });
    }
});
