const { send }  = require('micro')
const { fetch } = require('../helpers/database')

module.exports = async (req, res) => {
    if (req.params.uid) {
        console.log(`fetching job ${req.params.uid}`)
        send(res, 200, await fetch(req.params.uid))
    // TODO: Write test
    } else if(req.query.type) {
        console.log(`fetching jobs by type ${req.query.type}`)
        send(res, 200, await fetch(null,req.query.type))
    } else {
        console.log(`fetching list of all jobs`)
        send(res, 200, await fetch())
    }
}
