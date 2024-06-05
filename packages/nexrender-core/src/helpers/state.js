module.exports = (job, settings, updateJob, fn, fnName) => {
    job.state = `render:${fnName}`;

    if (job.onChange) {
        job.onChange(job, job.state);
    }

    return fn(job, settings, updateJob);
}
