const { send }  = require('micro')
const { fetch, count } = require('../helpers/database')

const transformResults = (results, pagination) => {
    return {
        results,
        meta: pagination
    }
}

const paginate = (results, { page, size }) => {
    const index = (page - 1) * size;
    return results
        .reverse()
        .slice(index, index + size)
        .reverse();
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
    const { page = 1, size = 20 } = req.query || {};
    const total = await count(req.params.uid, req.query.types)

    if (req.params.uid) {
        console.log(`fetching job ${req.params.uid}`)

        send(res, 200, await fetch(req.params.uid))
    } else if(req.query.types) {
        const parsedTypes = req.query.types.split(',')
        console.log(`fetching jobs by types ${parsedTypes.join(',')}`)

        const results = fetch(null,parsedTypes)

        const finalResults = page ?
            paginate(results, {
                page: clamp(page, { min: 1 }),
                size: clamp(size, { min: 1, max: 30 })
            })
            : results

        const transformed = transformResults(finalResults, {page, size, total})

        send(res, 200, transformed)
    } else {
        console.log(`fetching list of all jobs`)

        const results = await fetch()
        const finalResults = page ?
            paginate(results, {
                page: clamp(page, { min: 1 }),
                size: clamp(size, { min: 1, max: 30 })
            })
            : results

        const transformed = transformResults(finalResults, {page, size, total})

        send(res, 200, transformed)
    }
}
