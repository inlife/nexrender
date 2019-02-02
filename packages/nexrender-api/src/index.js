const fetch = require('node-fetch')

const createClient = ({ host, secret }) => {
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

    return Object.assign({},
        require('./job')(wrappedFetch)
    );
}

module.exports = {
    createClient,
}
