const { send } = require('micro')

const withSecret = (secret, handler) => (req, res) => {
    if (!secret && !secret.length) {
        return handler(req, res)
    }

    if (req.headers['nexrender-secret'] != secret) {
        return send(res, 403, 'Wrong or no authentication secret provided. Please check the "nexrender-secret" header.')
    }

    return handler(req, res)
}

module.exports = {
    withSecret,
}
