// require node fetch if we are in nodejs environment (not browser)
const localFetch = typeof process == 'undefined' ? fetch : require('node-fetch')
const fetchAgent = typeof process == 'undefined' ? null : require('http').Agent

const createClient = ({ host, secret, polling, headers }) => {
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

        if (typeof process != 'undefined') {
            // NOTE: keepalive is enabled by default in node-fetch, so we need to disable it because of a bug
            options.agent = new fetchAgent({ keepAlive: false })
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
