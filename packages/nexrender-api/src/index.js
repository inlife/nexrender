const projects  = require('./projects')

const DEFAULT_API_PROTO = 'http';
const DEFAULT_API_HOST = 'localhost';
const DEFAULT_API_PORT = 3000;

class client {
    constructor(host) {
        this.host = host;
        this.projects = projects(host, this)
    }
};

module.exports = {
    /**
     * Configuration for api connections
     * @param  {Object} opts
     */
    create: (opts) => {
        var opts = opts || {};

        let proto = opts.proto || opts.protocol || DEFAULT_API_PROTO;
        let host = opts.host || DEFAULT_API_HOST;
        let port = opts.port || DEFAULT_API_PORT;

        return new client([proto, '://', host, ':', port, '/api'].join(''))
    },
};
