const { send }   = require('micro')
const { fetch }  = require('../helpers/database')
const { update } = require('../helpers/database')

module.exports = async (req, res) => {
    console.log(`fetching a pickup job for a worker`)

    const listing = fetch()
    const queued  = listing.filter(job => job.state == 'queued')

    if (queued.length < 1) {
        return send(res, 200, {})
    }

    const job = queued[Math.floor(Math.random() * queued.length)];

    /* update the job locally, and send it to the worker */
    send(res, 200, update(job.uid, { state: 'picked' }))
}
