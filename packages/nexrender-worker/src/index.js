const { createClient } = require('@nexrender/api')
const { init, render } = require('@nexrender/core')

const NEXRENDER_API_POLLING = process.env.NEXRENDER_API_POLLING || 30 * 1000;

/* TODO: possibly add support for graceful shutdown */
let active = true;

const delay = amount => (
    new Promise(resolve => setTimeout(resolve, amount))
)

const nextJob = async (client, settings) => {
    do {
        try {
            const job = await client.pickupJob();

            if (job && job.uid) {
                return job
            }
        } catch (err) {
            if (settings.stopOnError) {
                throw err;
            } else {
                console.error(err)
            }
        }

        await delay(settings.polling || NEXRENDER_API_POLLING)
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
        let job = await nextJob(client, settings); {
            job.state = 'started';
        }

        try {
            await client.updateJob(job.uid, job)
        } catch(err) {
            console.log(`[${job.uid}] error while updating job state to ${job.state}. Job abandoned.`)
            continue;
        }

        try {
            job.onRenderProgress = function (job, progress) {
                /* send render prooress to our server */
                client.updateJob(job.uid, job)
            }

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
            } else {
                console.log(`[${job.uid}] error occurred: ${err.stack}`)
            }
        }
    } while (active)
}

module.exports = { start }
