const { createClient } = require('@create-global/nexrender-api')
const { init, render } = require('@create-global/nexrender-core')
const { getRenderingStatus } = require('@create-global/nexrender-types/job')
const rimraf = require('rimraf')

const NEXRENDER_API_POLLING = process.env.NEXRENDER_API_POLLING || 30 * 1000;
const NEXRENDER_MAX_RETRIES = process.env.NEXRENDER_MAX_RETRIES || 2
const NEXRENDER_TIMEOUT = process.env.NEXRENDER_TIMEOUT || 1000 * 60 * 30 // 30 minutes

/* TODO: possibly add support for graceful shutdown */
let active = true;

const delay = amount => (
    new Promise(resolve => setTimeout(resolve, amount))
)

const waitAndThrow = (ms, errorMessage) => {
    return new Promise((_, reject) => {
        setTimeout(() => {
            reject(errorMessage);
        }, ms);
    });
};

const nextJob = async (client, settings) => {
    do {
        try {
            // Check to see if we should pickup, otherwise skip till
            // next check
            const isReadyForPickup = await settings.onReadyForPickup()
            if (isReadyForPickup) {
                const job = await client.pickupJob();

                if (job && job.uid) {
                    return job
                }
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
    // onReadyForPickup will be called before each pickup attempt
    // return false to skip pickup. Return true to pickup
    if (!settings.onReadyForPickup) {
        settings.onReadyForPickup = () => true
    }

    const client = createClient({ host, secret });

    do {
        let job = await nextJob(client, settings); {
            job.state = 'started';
            job.startedAt = new Date()
        }

        try {
            await client.updateJob(job.uid, job)
        } catch(err) {
            console.log(`[${job.uid}] error while updating job state to ${job.state}. Job abandoned.`)
            console.log(`[${job.uid}] error stack: ${err.stack}`)
            continue;
        }

        try {
            job.onRenderProgress = function (job, /* progress */) {
                try {
                    /* send render progress to our server */
                    client.updateJob(job.uid, getRenderingStatus(job))
                } catch (err) {
                    if (settings.stopOnError) {
                        throw err;
                    } else {
                        console.log(`[${job.uid}] error occurred: ${err.stack}`)
                    }
                }
            }

            job = await Promise.race([
                waitAndThrow(NEXRENDER_TIMEOUT, 'render timeout'),
                render(job, settings)
            ]);
            job.state = 'finished';
            job.finishedAt = new Date()

            await client.updateJob(job.uid, getRenderingStatus(job))
        } catch (err) {
            job.retries = job.retries || 0

            if (err.retry !== false && job.retries <= NEXRENDER_MAX_RETRIES) {
                job.retries += 1;
                job.state = 'queued';

                // Remove re-queued jobs as they may be picked up
                // by the same worker
                // sometimes this attribute (workpath) is undefined
                if (!job.workpath) {
                    job.workpath = settings.workpath.concat('/', job.uid, '/')
                }
                await new Promise((resolve) => {
                    rimraf(job.workpath, {glob: false}, (err) => {
                        if (err) {
                            console.error(err);
                        }
                        resolve()
                    })
                })
            } else {
                job.state = 'error';
            }
            job.error = err;
            job.errorAt = new Date()

            await client.updateJob(job.uid, getRenderingStatus(job)).catch((err) => {
                if (settings.stopOnError) {
                    throw err;
                } else {
                    console.log(`[${job.uid}] error occurred: ${err.stack}`)
                }
            });

            if (settings.stopOnError) {
                throw err;
            } else {
                console.log(`[${job.uid}] error occurred: ${err.stack}`)
            }
        }
    } while (active)
}

module.exports = { start }
