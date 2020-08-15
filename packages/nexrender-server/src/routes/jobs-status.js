const { send }  = require('micro')
const { fetch } = require('../helpers/database')
const { getStatusFromJob } = require('../helpers/job-formatter')

module.exports = async (req, res) => {
    if (req.params.uid) {
        console.log(`fetching job status ${req.params.uid}`)
        send(res, 200, getStatusFromJob(fetch(req.params.uid)))
    } else {
        console.log(`fetching status list of all jobs`)
        send(res, 200, fetch().map(getStatusFromJob))
    }
}
