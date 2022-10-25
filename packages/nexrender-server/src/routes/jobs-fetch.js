const { send }  = require('micro')
const { fetch } = require('../helpers/database')

const paginate = (results, { page, size }) => {
    const index = (page - 1) * size;
    const pagedResults = results
        .reverse()
        .slice(index, index + size)
        .reverse();

    return pagedResults
}

const clamp = (input, { min, max }) => {
    if (input < min) {
        return min;
    }
    if (max && input > max) {
        return max;
    }
    return input;
};

module.exports = async (req, res) => {
    const { page, size = 20 } = req.query || {};

    if (req.params.uid) {
        console.log(`fetching job ${req.params.uid}`)

        send(res, 200, await fetch(req.params.uid))
    } else if(req.query.types) {
        const parsedTypes = req.query.types.split(',')
        console.log(`fetching jobs by types ${parsedTypes.join(',')}`)

        send(res, 200, await fetch(null,parsedTypes))
    } else {
        console.log(`fetching list of all jobs`)
        const results = await fetch()
        const finalResults = page ?
            paginate(results, {
                page: clamp(page, { min: 1 }),
                size: clamp(size, { min: 1, max: 30 })
            })
            : results
        send(res, 200, finalResults)
    }
}
