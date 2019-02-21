const fetch = require('isomorphic-unfetch')

const createClient = ({ host, secret, polling }) => {
    const wrappedFetch = async (path, options) => {
        const response = await fetch(`${host}/api/v1${path}`, Object.assign(secret
            ? {headers: {'nexrender-secret': secret}}
            : {}, options
        ))

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
