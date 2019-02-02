const assert               = require('assert')
const { send, json }       = require('micro')
const { create, validate } = require('@nexrender/types/job')
const { insert }           = require('../helpers/database')

module.exports = async (req, res) => {
    const data = await json(req)
    const job  = create(data); {
        job.state = 'queued';
        job.createdAt = new Date();
        job.updatedAt = new Date();
    }

    console.log(`creating new job ${job.uid}`)

    try {
        assert(validate(job) == true);
        insert(job);
    } catch (err) {
        return send(res, 400, err.stack)
    }

    send(res, 200, job)
}
