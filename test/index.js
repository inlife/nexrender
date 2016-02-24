'use strict';

// override console.info (disable output from modules)
console.info = function() {};

const path = require('path');

// override paths for test folder
process.env.TEMP_DIRECTORY      = path.join('test', 'temp');
process.env.TEMPLATES_DIRECTORY = path.join('test', 'templates');

const nexrender = require('..');

describe('Testing project', () => {
    require('./renderer/');
    require('./server/');
    require('./api/');
});
