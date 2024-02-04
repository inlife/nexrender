const assert               = require('assert')
const { send, json }       = require('micro')
const { create, validate } = require('@nexrender/types/job')
const { insert }           = require('../helpers/database')

module.exports = async (req, res) => {
    const data = await json(req, {limit: "100mb"})

    if (typeof data.tags == 'string') {
        data.tags = data.tags.replace(/[^a-z0-9, ]/gi, '')
    }

    const job = await create(data); {
        job.state = 'queued';
        job.creator = req.headers["x-forwarded-for"] || req.socket.remoteAddress
    }

    console.log(`creating new job ${job.uid}`)

    try {
        assert(validate(job) == true);
        await insert(job);
    } catch (err) {
        return send(res, 400, err.stack)
    }

    send(res, 200, job)
}
