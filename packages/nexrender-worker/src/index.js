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
        environment: process.env.ENVIRONMENT
      }
    });
}


if(process.env.ENABLE_DATADOG_APM) {
    var tracer = require('dd-trace').init();
    var renderWithTrace = tracer.wrap('render', render);
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

const processJob = async (client, settings, job) => {
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
        console.log(`[${job.uid}] error occurred: ${err.stack}`);
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
    let job = await nextJob(client, settings); {
        job.state = 'started';
        job.startedAt = new Date()
    }
    return job
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
            await tracer.trace('job', async span => {
                let job = await nextJobSetStarted(client, settings);
                span.setTag('uid', job.uid);
                await processJob(client, settings, job)
            })
        }
        else {
            let job = await nextJobSetStarted(client, settings);
            await processJob(client, settings, job)
        } 
    } while (active)
}

module.exports = { start }
