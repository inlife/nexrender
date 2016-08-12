'use strict';

module.exports = {
    api:        require('./api'),
    project:    require('./api/models/project'),
    server:     require('./server'),
    renderer:   require('./renderer'),
    version:    require('./package.json').version
};
