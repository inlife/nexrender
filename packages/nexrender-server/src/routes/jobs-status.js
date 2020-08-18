const { send }  = require('micro')
const { fetch } = require('../helpers/database')
const { getRenderingStatus } = require('@nexrender/types/job')

module.exports = async (req, res) => {
    if (req.params.uid) {
        console.log(`fetching job status ${req.params.uid}`)
        send(res, 200, getRenderingStatus(fetch(req.params.uid)))
    } else {
        console.log(`fetching status list of all jobs`)
        send(res, 200, fetch().map(getRenderingStatus))
    }
}
