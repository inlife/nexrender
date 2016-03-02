#!/usr/bin/env node

'use strict';

const os        = require('os');
const cli       = require('cli').enable('version');
const nexrender = require('./index.js');

cli.parse({
    'version':      ['v',   'Get version'],

    // render node params
    'renderer':     ['r',   'Start renderer'],
    'aerender':     [false, 'PATH to aerender binary',      'path'],
    'host':         ['h',   'Remote HOST:PORT to connect',  'string',   'localhost:3000'],
    'mem':          [false, 'aerender % of memory',         'string'],
    'mp':           [false, 'aerender multi frames'],

    // api server params
    'api-server':   ['s',   'Start api server'],
    'port':         ['p',   'Listen on port',               'number',   3000]
});


cli.main(function(args, options) {

// fancy logo
console.log(`
                                   | |          
 _ __   _____  ___ __ ___ _ __   __| | ___ _ __ 
| '_ \\ / _ \\ \\/ / '__/ _ \\ '_ \\ / _\` |/ _ \\ '__|
| | | |  __/>  <| | |  __/ | | | (_| |  __/ |   
|_| |_|\\___/_/\\_\\_|  \\___|_| |_|\\__,_|\\___|_|   

                  VERSION: ${nexrender.version} 

For support and information, please visit:
http://github.com/Inlife/nexrender
`);

    if (options.version) {
        return console.log('nexrender version:', nexrender.version)
    }

    if (options['api-server']) {
        process.title = 'nexrender.api';

        nexrender.server.start(options.port);
    }

    if (options['renderer']) {
        process.title = 'nexrender.renderer';

        if (['darwin', 'win32', 'win64'].indexOf( os.platform() ) === -1) {
            console.warn('[error] you might be considering to run renderer on officialy supported platform');
        }

        if (!options.aerender) {
            return console.error('[error] provide --aerender=PATH for aerender binary file');
        }

        if (options.host.indexOf(':') === -1) {
            return console.error('[error] renderer host option must look like HOST:PORT');
        }

        // split uri on host and port
        let uri = options.host.split(':');

        nexrender.renderer.start({
            host: uri[0],
            port: uri[1],
            aerender: options.aerender,
            memory: options.mem || undefined,
            multiframes: options.mp || false
        });
    }
});
