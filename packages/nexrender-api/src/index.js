if(process.env.ENABLE_DATADOG_APM) {
    var tracer = require('dd-trace').init();
}

const fetch = require('isomorphic-unfetch')

const createClient = ({ host, secret, polling }) => {
    const wrappedFetch = async (path, options) => {
        options = options || {}
        options.headers = options.headers || {}

        if (secret) {
            options.headers['nexrender-secret'] = secret
        }

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
