const { createClient } = require('@nexrender/api')
const { init, render } = require('@nexrender/core')

const NEXRENDER_API_POLLING = process.env.NEXRENDER_API_POLLING || 30 * 1000;

/* TODO: possibly add support for graceful shutdown */
let active = true;

const delay = amount => (
    new Promise(resolve => setTimeout(resolve, amount))
)

const nextJob = async client => {
    do {
        const listing = await client.listJobs();
        const queued  = listing.filter(job => job.state == 'queued')

        if (queued.length > 0) {
            return queued[0];
        }

        await delay(NEXRENDER_API_POLLING)
    } while (active)
}

/**
 * Starts worker "thread" of continious loop
 * of fetching queued projects and rendering them
 * @param  {String} host
 * @param  {String} secret
 * @param  {Object} settings
 * @return {Promise}
 */
const start = async (host, secret, settings) => {
    settings = init(Object.assign({}, settings, {
        logger: console,
    }))

    const client = createClient({ host, secret });

    do {
        let job = await nextJob(client); {
            job.state = 'started';
        }

        await client.updateJob(job.uid, job)

        try {
            job = await render(job, settings); {
                job.state = 'finished';
            }

            await client.updateJob(job.uid, job)
        } catch (err) {
            job.state = 'error';
            job.error = err;

            await client.updateJob(job.uid, job);

            if (settings.stopOnError) {
                throw err;
            }
        }
    } while (active)
}

module.exports = { start }
