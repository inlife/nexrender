const { send }  = require('micro')
const { fetch } = require('../helpers/database')

module.exports = async (req, res) =>
    console.log(`fetching list of all jobs`)
    || send(res, 200, fetch())
