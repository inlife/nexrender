const { createClient } = require('@nexrender/api')
const { init, render } = require('@nexrender/core')
const { getRenderingStatus } = require('@nexrender/types/job')
const pkg = require('../package.json')

const NEXRENDER_API_POLLING = process.env.NEXRENDER_API_POLLING || 30 * 1000;
const NEXRENDER_TOLERATE_EMPTY_QUEUES = process.env.NEXRENDER_TOLERATE_EMPTY_QUEUES;

const delay = amount => new Promise(resolve => setTimeout(resolve, amount))

const createWorker = () => {
    let emptyReturns = 0;
    let active = false;
    let settingsRef = null;
    let stop_datetime = null;
    let currentJob = null;
    let client = null;

    // New function to handle interruption
    const handleInterruption = async () => {
        if (currentJob) {
            settingsRef.logger.log(`[${currentJob.uid}] Interruption signal received. Updating job state to 'queued'...`);
            currentJob.onRenderProgress = null;
            currentJob.state = 'queued';
            try {
                await client.updateJob(currentJob.uid, getRenderingStatus(currentJob));
                settingsRef.logger.log(`[${currentJob.uid}] Job state updated to 'queued' successfully.`);
            } catch (err) {
                settingsRef.logger.error(`[${currentJob.uid}] Failed to update job state: ${err.message}`);
            }
        }
        active = false;
        process.exit(0);
    };

    const nextJob = async (client, settings) => {
        do {
            try {
                if (stop_datetime !== null && new Date() > stop_datetime) {
                    active = false;
                    return null
                }

                let job = await (settings.tagSelector ?
                    await client.pickupJob(settings.tagSelector) :
                    await client.pickupJob()
                );

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
    const start = async (host, secret, settings, headers) => {
        settings = init(Object.assign({
            process: 'nexrender-worker',
            stopOnError: false,
            logger: console,
            handleInterruption: false,
        }, settings))

        settingsRef = settings;
        active = true;

        settings.logger.log('starting nexrender-worker with following settings:')
        Object.keys(settings).forEach(key => {
            settings.logger.log(` - ${key}: ${settings[key]}`)
        })

        if (typeof settings.tagSelector == 'string') {
            settings.tagSelector = settings.tagSelector.replace(/[^a-z0-9, ]/gi, '')
        }
        // if there is no setting for how many empty queues to tolerate, make one from the
        // environment variable, or the default (which is zero)
        if (!(typeof settings.tolerateEmptyQueues == 'number')) {
            settings.tolerateEmptyQueues = NEXRENDER_TOLERATE_EMPTY_QUEUES;
        }

        headers = headers || {};
        headers['user-agent'] = ('nexrender-worker/' + pkg.version + ' ' + (headers['user-agent'] || '')).trim();

        client = createClient({ host, secret, headers, name: settings.name });

        settings.track('Worker Started', {
            worker_tags_set: !!settings.tagSelector,
            worker_setting_tolerate_empty_queues: settings.tolerateEmptyQueues,
            worker_setting_exit_on_empty_queue: settings.exitOnEmptyQueue,
            worker_setting_polling: settings.polling,
            worker_setting_stop_on_error: settings.stopOnError,
        })

        if(settings.stopAtTime) {
            let stopTimeParts = settings.stopAtTime.split(':'); // split the hour and minute
            let now = new Date(); // get current date object

            stop_datetime = new Date(); // new date object for stopping time
            stop_datetime.setHours(stopTimeParts[0], stopTimeParts[1], 0, 0); // set the stop time

            if(stop_datetime.getTime() <= now.getTime()){
                stop_datetime.setDate(stop_datetime.getDate() + 1); // if it's past the stop time, move it to next day
            }

            if(settings.stopDays) {
                let stopDaysList = settings.stopDays.split(',').map(Number); // convert string weekdays into integer values
                while(!stopDaysList.includes(stop_datetime.getDay())) {
                    stop_datetime.setDate(stop_datetime.getDate() + 1); // if stop_datetime's weekday is not in the list, add one day
                }
            }
        }

        // Set up interruption handlers if enabled
        if (settings.handleInterruption) {
            process.on('SIGINT', handleInterruption);
            process.on('SIGTERM', handleInterruption);
            settingsRef.logger.log('Interruption handling enabled.');
        }

        do {
            currentJob = await nextJob(client, settings);

            // if the worker has been deactivated, exit this loop
            if (!active) break;

            settings.track('Worker Job Started', {
                job_id: currentJob.uid, // anonymized internally
            })

            currentJob.state = 'started';
            currentJob.startedAt = new Date()

            try {
                await client.updateJob(currentJob.uid, currentJob)
            } catch (err) {
                console.log(`[${currentJob.uid}] error while updating job state to ${currentJob.state}. Job abandoned.`)
                console.log(`[${currentJob.uid}] error stack: ${err.stack}`)
                continue;
            }

            try {
                currentJob.onRenderProgress = ((c, s) => (job) => {
                    try {
                        /* send render progress to our server */
                        c.updateJob(job.uid, getRenderingStatus(job));

                        if (s.onRenderProgress) {
                            s.onRenderProgress(job);
                        }
                    } catch (err) {
                        if (s.stopOnError) {
                            throw err;
                        } else {
                            console.log(`[${job.uid}] error occurred: ${err.stack}`)
                            console.log(`[${job.uid}] render proccess stopped with error...`)
                            console.log(`[${job.uid}] continue listening next job...`)
                        }
                    }
                })(client, settings);

                currentJob.onRenderError = (currentJob, err /* on render error */) => {
                    currentJob.error = [].concat(currentJob.error || [], [err.toString()]);

                    if (settings.onRenderError) {
                        settings.onRenderError(currentJob, err);
                    }
                }

                currentJob = await render(currentJob, settings); {
                    currentJob.state = 'finished';
                    currentJob.finishedAt = new Date();
                    if (settings.onFinished) {
                        settings.onFinished(currentJob);
                    }
                }

                settings.track('Worker Job Finished', { job_id: currentJob.uid })

                await client.updateJob(currentJob.uid, getRenderingStatus(currentJob))
            } catch (err) {
                currentJob.error = [].concat(currentJob.error || [], [err.toString()]);
                currentJob.errorAt = new Date();
                currentJob.state = 'error';

                settings.track('Worker Job Error', { job_id: currentJob.uid });

                if (settings.onError) {
                    settings.onError(currentJob, err);
                }

                try {
                    await client.updateJob(currentJob.uid, getRenderingStatus(currentJob))
                }
                catch (e) {
                    console.log(`[${currentJob.uid}] error while updating job state to ${currentJob.state}. Job abandoned.`)
                    console.log(`[${currentJob.uid}] error stack: ${e.stack}`)
                }

                if (settings.stopOnError) {
                    throw err;
                } else {
                    console.log(`[${currentJob.uid}] error occurred: ${err.stack}`)
                    console.log(`[${currentJob.uid}] render proccess stopped with error...`)
                    console.log(`[${currentJob.uid}] continue listening next job...`)
                }
            }

            if (settings.waitBetweenJobs) {
                await delay(settings.waitBetweenJobs);
            }
        } while (active)

        // Clean up interruption handlers
        if (settings.handleInterruption) {
            process.removeListener('SIGINT', handleInterruption);
            process.removeListener('SIGTERM', handleInterruption);
        }
    }

    /**
     * Stops worker "thread"
     * @return {void}
     */
    const stop = () => {
        if (settingsRef) {
            settingsRef.logger.log('stopping nexrender-worker')
        }

        active = false;
    }

    /**
     * Returns the current status of the worker
     * @return {Boolean}
     */
    const isRunning = () => {
        return active;
    }

    return {
        start,
        stop,
        isRunning
    }
}

module.exports = {
    createWorker,
}
