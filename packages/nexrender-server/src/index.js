const micro = require('micro')

const { router, withNamespace } = require('microrouter')
const { get, post, put, del }   = require('microrouter')
const { withSecret }            = require('./helpers/secret')

const ns = withNamespace('/api/v1')

const handler = secret => withSecret(secret, router(
    ns(get('/jobs',      require('./routes/jobs-fetch'))),
    ns(post('/jobs',     require('./routes/jobs-create'))),
    ns(put('/jobs/:uid', require('./routes/jobs-update'))),
    ns(del('/jobs/:uid', require('./routes/jobs-remove')))
))

module.exports = {
    listen: (port = 3000, secret = '') => (
        micro(handler(secret)).listen(port)
    )
}
