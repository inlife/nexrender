const fetch = require('isomorphic-unfetch')

const createClient = ({ host, secret, polling, headers }) => {
    const wrappedFetch = async (path, options) => {
        options = options || {}

        const defaultHeaders = {};
        if(headers){
            for(const [key, value] of Object.entries(headers)){
                if(typeof value === "string"){
                    defaultHeaders[key] = value;
                }else if(typeof value === "function"){
                    defaultHeaders[key] = await value();
                }
            }
        }

        options.headers = Object.assign(defaultHeaders, options.headers);

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
