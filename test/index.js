'use strict';

// override console.info (disable output from modules)
console.info = function() {};

describe('Testing project', () => {
    require('./renderer/');
    require('./server/');
    require('./api/');
});
