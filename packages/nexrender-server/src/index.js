const cors   = require('micro-cors')
const micro  = require('micro')
const {send} = require('micro')

const withCors = cors({ allowHeaders: ['X-Requested-With','Access-Control-Allow-Origin','X-HTTP-Method-Override','Content-Type','Authorization','Accept','nexrender-secret','nexrender-name']})

const { router, withNamespace } = require('microrouter')
const { get, post, put, del }   = require('microrouter')
const { withSecret }            = require('./helpers/secret')

const ns = withNamespace('/api/v1')

const subhandler = router(
    ns(post('/jobs',            require('./routes/jobs-create'))),
    ns(get('/jobs',             require('./routes/jobs-fetch'))),
    ns(get('/jobs/status',      require('./routes/jobs-status'))),
    ns(get('/jobs/pickup',      require('./routes/jobs-pickup'))),
    ns(get('/jobs/pickup/:tags',require('./routes/jobs-pickup'))),
    ns(get('/jobs/:uid/status', require('./routes/jobs-status'))),
    ns(get('/jobs/:uid',        require('./routes/jobs-fetch'))),
    ns(put('/jobs/:uid',        require('./routes/jobs-update'))),
    ns(del('/jobs/:uid',        require('./routes/jobs-remove'))),
)

const handler = secret => {
    return withCors((req, res) => {
        if (req.method == 'OPTIONS') {
            return send(res, 200, 'ok');
        }

        if (req.method == 'GET' && req.url == '/api/v1/health') {
            return send(res, 200, 'ok');
        }

        return withSecret(secret, subhandler)(req, res)
    })
}

module.exports = {
    createHandler: handler,
    listen: (port = 3000, secret = '', callback) => {
        return micro(handler(secret)).listen(port, callback)
    }
}
