const EventEmitter = require('events');

const NEXRENDER_JOB_POLLING = process.env.NEXRENDER_JOB_POLLING || 10 * 1000;

const withEventEmitter = (fetch, job, polling = NEXRENDER_JOB_POLLING) => {
    const emitter  = new EventEmitter();
    const interval = setInterval(async () => {
        try {
            const updatedJob = await fetch(`/jobs/${job.uid}`)

            if (job.state != updatedJob.state) {
                job.state = updatedJob.state;
                emitter.emit(job.state, updatedJob, fetch);
            }

            if (job.state == 'finished' || job.state == 'error') {
                clearInterval(interval);
            }
        } catch (err) {
            clearInterval(interval);
            emitter.emit('error', err);
        }

    }, polling);

    /* trigger first callback */
    setImmediate(() => emitter.emit('created', job))

    return emitter;
}

module.exports = (fetch, polling) => ({
    listJobs: async () => await fetch(`/jobs`),
    pickupJob: async () => await fetch(`/jobs/pickup`),

    addJob: async data =>
        withEventEmitter(fetch, await fetch(`/jobs`, {
            method: 'post',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(data),
        }), polling),

    updateJob: async (id, data) =>
        await fetch(`/jobs/${id}`, {
            method: 'put',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(data),
        }),

    removeJob: async id =>
        await fetch(`/jobs/${id}`, {
            method: 'delete'
        }),
})

/* deprecated method name */
/* keeping for now for, backward compatibility */
module.exports.removejob = module.exports.removeJob
