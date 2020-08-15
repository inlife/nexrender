
const getStatusFromJob = job => ({uid: job.uid, state: job.state, type: job.type, renderProgress: job.renderProgress || 0})

module.exports = {
    getStatusFromJob
}
