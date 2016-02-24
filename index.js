'use strict';

module.exports = {
    api:        require('./api'),
    server:     require('./server'),
    renderer:   require('./renderer'),
    version:    require('./package.json').version
};
