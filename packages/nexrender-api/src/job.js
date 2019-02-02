const EventEmitter = require('events');

const NEXRENDER_JOB_POLLING = process.env.NEXRENDER_JOB_POLLING || 1000 * 10;

const withEventEmitter = (fetch, job) => {
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

    }, NEXRENDER_JOB_POLLING);

    /* trigger first callback */
    setImmediate(() => emitter.emit('created', job))

    return emitter;
}

module.exports = fetch => ({
    listJobs: async () => await fetch(`/jobs`),

    addJob: async data =>
        withEventEmitter(fetch, await fetch(`/jobs`, {
            'method': 'post',
            'content-type': 'application/json',
            'body': JSON.stringify(data),
        })),

    updateJob: async (id, data) =>
        await fetch(`/jobs/${id}`, {
            'method': 'put',
            'content-type': 'application/json',
            'body': JSON.stringify(Object.assign(data, {updatedAt: new Date()})),
        }),

    removejob: async id =>
        await fetch(`/jobs/${id}`, {
            'method': 'delete'
        }),
})
