const originalFetch = require('isomorphic-unfetch');
const fetch = require('fetch-retry')(originalFetch);

const retryDelayDefault = (attempt) => Math.pow(2, attempt) * 1000;

const createClient = ({ host, secret, polling }) => {
    const wrappedFetch = async (path, options) => {
        options = options || {}
        options.headers = options.headers || {}

        if (secret) {
            options.headers['nexrender-secret'] = secret
        }

        // Retry
        options.retries = options.retries || 5;
        options.retryDelay = options.retryDelay || retryDelayDefault;
        options.retryOn = options.retryOn || [500, 501, 502, 503, 504];

        const response = await fetch(`${host}/api/v1${path}`, options)

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
