const assert            = require('assert')
const { send, json }    = require('micro')
const { validate }      = require('@nexrender/types/job')
const { update, fetch } = require('../helpers/database')

module.exports = async (req, res) => {
    const data = await json(req)
    const job  = Object.assign({}, fetch(req.params.uid) || {}, data);

    console.log(`updating job ${job.uid}`)

    try {
        assert(validate(job) == true);
        send(res, 200, update(req.params.uid, data));
    } catch (err) {
        return send(res, 400, err.stack)
    }
}
