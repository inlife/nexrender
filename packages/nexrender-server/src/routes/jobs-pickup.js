const { send }   = require('micro')
const { fetch }  = require('../helpers/database')
const { update } = require('../helpers/database')
const { Mutex }  = require('async-mutex');

const mutex = new Mutex();

module.exports = async (req, res) => {
    const release = await mutex.acquire();

    try{
        console.log(`fetching a pickup job for a worker`)

        // Default to 'default' jobs for backwards compatibility
        const types = req.query.types ? req.query.types.split(',') : ['default']

        const listing = await fetch(null,types)
        const queued  = listing.filter(job => job.state == 'queued')

        if (queued.length < 1) {
            return send(res, 200, {})
        }

        let job;

        if (process.env.NEXRENDER_ORDERING == 'random') {
            job = queued[Math.floor(Math.random() * queued.length)];
        }
        else if (process.env.NEXRENDER_ORDERING == 'newest-first') {
            job = queued[queued.length-1];
        } else if (process.env.NEXRENDER_ORDERING == 'priority') {
            // Get the job with the largest priority number
            // This will also sort them by the date, so if 2 jobs have the same
            // priority, it will choose the oldest one because that's the original state
            // of the array in question
            job = queued.sort((a, b) => {
                // Quick sanitisation to make sure they're numbers
                if (isNaN(a.priority)) a.priority = 0
                if (isNaN(b.priority)) b.priority = 0
                return b.priority - a.priority
            })[0]
        }
        else { /* fifo (oldest-first) */
            job = queued[0];
        }

        /* update the job locally, and send it to the worker */
        send(res, 200, await update(job.uid, { state: 'picked', executor: req.headers["x-forwarded-for"] || req.socket.remoteAddress }))
    } finally {
        release();
    }
}
