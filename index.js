'use strict';

// setup global logging
global.winston = require('winston');

// add timestamping
// winston.remove( winston.transports.Console );
// winston.add( winston.transports.Console, { 'timestamp': true } );

module.exports = {
    api:        require('./api'),
    server:     require('./server'),
    renderer:   require('./renderer'),
    version:    require('./package.json').version
};
