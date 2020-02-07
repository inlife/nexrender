const micro = require('micro')
const cors  = require('micro-cors')()

const { router, withNamespace } = require('microrouter')
const { get, post, put, del }   = require('microrouter')
const { withSecret }            = require('./helpers/secret')

const ns = withNamespace('/api/v1')

const handler = secret => withSecret(secret, cors(router(
    ns(post('/jobs',       require('./routes/jobs-create'))),
    ns(get('/jobs',        require('./routes/jobs-fetch'))),
    ns(get('/jobs/pickup', require('./routes/jobs-pickup'))),
    ns(get('/jobs/:uid',   require('./routes/jobs-fetch'))),
    ns(put('/jobs/:uid',   require('./routes/jobs-update'))),
    ns(del('/jobs/:uid',   require('./routes/jobs-remove')))
)))

module.exports = {
    listen: (port = 3000, secret = '') => (
        micro(handler(secret)).listen(port)
    )
}
