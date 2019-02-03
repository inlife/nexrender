module.exports = (job, settings, fn, fnName) => {
    job.state = `render:${fnName}`;

    if (job.onChange) {
        job.onChange(job, job.state);
    }

    return fn(job, settings);
}
