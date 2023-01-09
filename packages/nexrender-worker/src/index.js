const { createClient } = require('@nexrender/api')
const { init, render } = require('@nexrender/core')
const { getRenderingStatus } = require('@nexrender/types/job')

const NEXRENDER_API_POLLING = process.env.NEXRENDER_API_POLLING || 30 * 1000;

// environment variable could hold the number of empty queue calls to tolerate. Defaults to zero.
const NEXRENDER_TOLERATE_EMPTY_QUEUES = process.env.NEXRENDER_TOLERATE_EMPTY_QUEUES || 0;
var emptyReturns = 0;

/* TODO: possibly add support for graceful shutdown */
let active = true;

const delay = amount => (
    new Promise(resolve => setTimeout(resolve, amount))
)

const nextJob = async (client, settings) => {
    do {
        try {
            let job = {};
            if(settings.tagSelector){
                job = await client.pickupJob(settings.tagSelector);
            }else{
                job = await client.pickupJob();
            }

            if (job && job.uid) {
                emptyReturns = 0;
                return job
            } else {
                // no job was returned by the server. If enough checks have passed, and the exit option is set, deactivate the worker
                emptyReturns++;
                if (settings.exitOnEmptyQueue && emptyReturns > settings.tolerateEmptyQueues) active = false;
            }
        } catch (err) {
            if (settings.stopOnError) {
                throw err;
            } else {
                console.error(err)
                console.error("render proccess stopped with error...")
                console.error("continue listening next job...")
            }
        }

        if (active) await delay(settings.polling || NEXRENDER_API_POLLING)

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

    if( typeof settings.tagSelector == 'string' ){
        settings.tagSelector = settings.tagSelector.replace(/[^a-z0-9, ]/gi, '')
    }

    // if there is no setting for how many empty queues to tolerate, make one from the
    // environment variable, or the default (which is zero)
    if( !typeof(settings.tolerateEmptyQueues == 'number') ){
        settings.tolerateEmptyQueues = NEXRENDER_TOLERATE_EMPTY_QUEUES;
    }

    const client = createClient({ host, secret });

    do {
        let job = await nextJob(client, settings); {
            job.state = 'started';
            job.startedAt = new Date()
        }

        // if the worker has been deactivated, exit this loop
        if (!active) break;

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
                        console.log(`[${job.uid}] render proccess stopped with error...`)
                        console.log(`[${job.uid}] continue listening next job...`)
                    }
                }
            }

            job.onRenderError = function (_, err /* on render error */) {
                /* set job render error to send to our server */
                if( typeof err.toString == "function" ){
                    job.error = [err.toString()];
                }else{
                    job.error = [err];
                }
            }

            job = await render(job, settings); {
                job.state = 'finished';
                job.finishedAt = new Date()
            }

            await client.updateJob(job.uid, getRenderingStatus(job))
        } catch (err) {
            job.state = 'error';

            /* append existing error message with another error message */
            if( job.hasOwnProperty("error") && job.error ) {
                if(Array.isArray(job.error)){
                    if( typeof job.error.toString == "function" ){ /* Use toString as possible to prevent JSON stringify null return */
                        job.error = [].concat.apply(job.error,[err.toString()]);
                    }else{
                        job.error = [].concat.apply(job.error,[err]);
                    }
                }else{
                    if( typeof job.error.toString == "function" ){ /* Use toString as possible to prevent JSON stringify null return */
                        job.error = [job.error.toString()];
                    }else{
                        job.error = [job.error];
                    }

                    if( typeof err.toString == "function" ){ /* Use toString as possible to prevent JSON stringify null return */
                        job.error.push(err.toString());
                    }else{
                        job.error.push(err);
                    }
                }
            }else{
                if( typeof err.toString == "function" ){  /* Use toString as possible to prevent JSON stringify null return */
                    job.error = err.toString();
                }else{
                    job.error = err;
                }
            }
            job.errorAt = new Date()

            await client.updateJob(job.uid, getRenderingStatus(job)).catch((err) => {
                if (settings.stopOnError) {
                    throw err;
                } else {
                    console.log(`[${job.uid}] error occurred: ${err.stack}`)
                    console.log(`[${job.uid}] render proccess stopped with error...`)
                    console.log(`[${job.uid}] continue listening next job...`)

                }
            });

            if (settings.stopOnError) {
                throw err;
            } else {
                console.log(`[${job.uid}] error occurred: ${err.stack}`)
                console.log(`[${job.uid}] render proccess stopped with error...`)
                console.log(`[${job.uid}] continue listening next job...`)
            }
        }
    } while (active)
}

module.exports = { start }
