#!/usr/bin/env node

'use strict';

const os        = require('os');
const cli       = require('cli').enable('version');
const noxrender = require('./index.js');

cli.parse({
    'aerender':     [false, 'PATH to aerender binary', 'path'],
    'api-server':   ['s', 'Start api server'],
    'renderer':     ['r', 'Start renderer'],
    'host':         ['h', 'Remote HOST:PORT to connect', 'host', 'localhost:3000'],
    'port':         ['p', 'Listen on port', 'port', 3000]
});

// Usage: 
// noxrender --renderer --host=localhost:3000 --aerender="/Applications/Adobe After Effects CC 2015/aerender"
//           -rh localhost:3000 --aerender="/Applications/Adobe After Effects CC 2015/aerender"
// noxrender --api-server --port=3000
//           -sp 3000

cli.main(function(args, options) {

    if (options['api-server']) {
        noxrender.server.start(options.port);
    }

    if (options['renderer']) {
        if (['darwin', 'win32', 'win64'].indexOf( os.platform() ) == -1) {
            console.warn('[error] you might be considering to run renderer on officialy supported platform');
        }

        if (!options.aerender) {
            return console.error('[error] provide --aerender=PATH for aerender binary file');
        }

        process.env.AE_BINARY = options.aerender;

        let host = options.host.split(':');

        noxrender.renderer.start( host[0], host[1] );
    }
});
