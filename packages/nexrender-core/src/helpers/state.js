module.exports = (job, settings, updateJob, fn, fnName) => {
    job.state = `render:${fnName}`;

    if (job.onChange) {
        job.onChange(job, job.state);
    }

    // Call the function that was passed in
    return fn(job, settings, updateJob);
}
