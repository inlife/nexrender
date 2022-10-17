const { send }  = require('micro')
const { fetch } = require('../helpers/database')

module.exports = async (req, res) => {
    if (req.params.uid) {
        console.log(`fetching job ${req.params.uid}`)

        send(res, 200, await fetch(req.params.uid))
    } else if(req.query.type) {
        send(res, 200, await fetch(null,req.query.type))
    } else {
        console.log(`fetching list of all jobs`)
        send(res, 200, await fetch())
    }
}
