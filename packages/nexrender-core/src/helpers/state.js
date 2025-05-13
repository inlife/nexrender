module.exports = (job, settings, fn, fnName) => {
    job.state = `render:${fnName}`;
    job.timings[job.state] = Date.now();

    if (job.onChange) {
        job.onChange(job, job.state);
    }

    return fn(job, settings);
}
