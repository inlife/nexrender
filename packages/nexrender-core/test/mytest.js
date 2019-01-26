module.exports = (job, settings) => {
    console.log('custom module hello world!')
    return Promise.resolve(job)
}
