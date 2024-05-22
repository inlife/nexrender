const {send} = require('micro')
const {fetch} = require('../helpers/database')

const transformResults = (results, meta) => {
    return {
        results,
        meta
    }
}

const paginate = (results, {page, size}) => {
    const index = (page - 1) * size

    return results
        .reverse()
        .slice(index, index + size)
        .reverse()
}

const clamp = (input, {min, max}) => {
    if (input < min) {
        return min
    }
    if (max && input > max) {
        return max
    }
    return input
}

const fetchAllJobs = async (page = 1, size = 20, types = [],) => {
    const results = await fetch(null, types)
    const total = results.length

    const paginatedResults = page ?
        paginate(results, {
            page: clamp(page, {min: 1}),
            size: clamp(size, {min: 1, max: 2000})
        })
        : results

    return transformResults(paginatedResults, {page, size, total})
}

module.exports = async (req, res) => {
    const page = parseInt(req.query.page || '1')
    const size = parseInt(req.query.size || '20')

    if (req.params.uid) {
        console.log(`fetching job ${req.params.uid}`)

        send(res, 200, await fetch(req.params.uid))
    } else if (req.query.types) {
        const types = req.query.types.split(',')
        console.log(`fetching page ${page} jobs by types ${types.join(',')}`)

        const jobs = await fetchAllJobs(page, size, types.map(type => ({ type })))

        send(res, 200, jobs)
    } else {
        console.log(`fetching page ${page} of all jobs`)

        const jobs = await fetchAllJobs(page, size)

        send(res, 200, jobs)
    }
}
