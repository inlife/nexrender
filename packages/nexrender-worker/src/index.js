const { createClient } = require('@nexrender/api')
const { init, render } = require('@nexrender/core')
const { getRenderingStatus } = require('@nexrender/types/job')

if(process.env.ENABLE_ROLLBAR) {
    var Rollbar = require('rollbar');
    var rollbar = new Rollbar({
      accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
      captureUncaught: true,
      captureUnhandledRejections: true,
      payload: {
        code_version: '1.0.0',
      }
    });
}


if(process.env.ENABLE_DATADOG_APM) {
    const tracer = require('dd-trace').init();
    const renderWithTrace = tracer.wrap('render', render);
}


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

const processJob = async (job) => {
    try {
        await client.updateJob(job.uid, job)
    } catch(err) {
        console.log(`[${job.uid}] error while updating job state to ${job.state}. Job abandoned.`)
        console.log(`[${job.uid}] error stack: ${err.stack}`)
        return;
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

        if (process.env.ENABLE_DATADOG_APM) {
            job = await renderWithTrace(job, settings); {
                job.state = 'finished';
                job.finishedAt = new Date()
            }
         }
         else {
            job = await render(job, settings); {
                job.state = 'finished';
                job.finishedAt = new Date()
            }
         }


        await client.updateJob(job.uid, getRenderingStatus(job))
    } catch (err) {
        job.state = 'error';
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
}

const nextJobSetStarted = async(client, settings) => {
    await nextJob(client, settings); {
        job.state = 'started';
        job.startedAt = new Date()
    }
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
        if(process.env.ENABLE_DATADOG_APM) {
            const scope = tracer.scope()
            const jobSpan = tracer.startSpan('job')
            scope.activate(jobSpan, async () => {
                let job = await nextJobSetStarted(client, settings)
                const jobUidSpan = tracer.startSpan(job.uid)
                scope.active(jobUidSpan, async () => {
                    await processJob(job)
                })
            })
        }
        else {
            let job = await nextJobSetStarted(client, settings)
            await processJob(job)
        } 
    } while (active)
}

module.exports = { start }
