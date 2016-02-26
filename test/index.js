'use strict';

// override console.info (disable output from modules)
console.info = function() {};

const path = require('path');

// override paths for test folder
process.env.TEMP_DIRECTORY          = path.join('test', 'temp');
process.env.TEMPLATES_DIRECTORY     = path.join('test', 'res');
process.env.RESULTS_DIR             = 'test';
process.env.API_REQUEST_INTERVAL    = 10;

const nexrender = require('..');

describe('Testing project', () => {
    require('./renderer/');
    require('./server/');
    require('./api/');
});
