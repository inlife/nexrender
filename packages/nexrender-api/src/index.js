const projects  = require('./projects')

const DEFAULT_API_SCHEME    = 'http';
const DEFAULT_API_HOST      = 'localhost';
const DEFAULT_API_PORT      = 3000;

class client {
    constructor(host, secret) {
        this.host   = host;
        this.secret = secret;

        this.projects = projects(host, secret, this)
    }
};

module.exports = {
    /**
     * Configuration for api connections
     * @param  {Object} opts
     */
    create: (options = {}) => {
        let scheme  = options.scheme    || DEFAULT_API_SCHEME;
        let host    = options.host      || DEFAULT_API_HOST;
        let port    = options.port      || DEFAULT_API_PORT;
        let secret  = options.secret    || '';

        return new client([scheme, '://', host, ':', port, '/api'].join(''), secret)
    },
};
