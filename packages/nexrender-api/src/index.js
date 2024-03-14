// require node fetch if we are in nodejs environment (not browser)
let localFetch = typeof process == 'undefined' ? fetch : require('node-fetch')
let fetchAgent = typeof process == 'undefined' ? null : { // eslint-disable-line multiline-ternary
    http: require('http').Agent,
    https: require('https').Agent,
}

const pkg = require('../package.json')

const createClient = ({ host, secret, polling, headers, name }) => {
    if (localFetch.default) {
        localFetch = localFetch.default
    }

    const wrappedFetch = async (path, options) => {
        options = options || {}
        const defaultHeaders = {};

        if (headers) {
            for (const [key, value] of Object.entries(headers)) {
                if (typeof value === "string") {
                    defaultHeaders[key] = value;
                } else if (typeof value === "function") {
                    defaultHeaders[key] = await value();
                }
            }
        }

        options.headers = Object.assign(defaultHeaders, options.headers);

        if (secret) {
            options.headers['nexrender-secret'] = secret
        }

        if (name) {
            options.headers['nexrender-name'] = name
        }

        options.headers['user-agent'] = ('nexrender-api/' + pkg.version + ' ' + (options.headers['user-agent'] || '')).trim()

        if (typeof process != 'undefined') {
            // NOTE: keepalive is enabled by default in node-fetch, so we need to disable it because of a bug
            // related to an invalidated session by the client
            options.agent = function(_parsedURL) {
                if (_parsedURL.protocol == 'http:') {
                    return new fetchAgent.http({ keepAlive: false });
                } else {
                    return new fetchAgent.https({ keepAlive: false });
                }
            }
        } else {
            options.keepalive = false
        }

        const response = await localFetch(`${host}/api/v1${path}`, options)

        if (!response.ok) {
            throw new Error(await response.text())
        }

        return await response.json();
    }

    return Object.assign({ secret, host },
        require('./job')(wrappedFetch, polling),
    );
}

module.exports = {
    createClient,
}
