const {send} = require('micro')
const {fetch} = require('../helpers/database')

const transformResults = (results, meta) => {
    return {
        results,
        meta: {
            ...meta,
            total: results.length,
        }
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

const filterAndSort = (results, types = []) => {
    // Filter by types and sort items so the oldest is always first
    return results.filter(result => !types.length || types.includes(result.type)).sort((a, b) => {
        return new Date(a.createdAt).getTime() > new Date(b.createdAt).getTime() ? 1 : -1
    })
}

module.exports = async (req, res) => {
    const page = parseInt(req.query.page || '1')
    const size = parseInt(req.query.size || '20')

    if (req.params.uid) {
        console.log(`fetching job ${req.params.uid}`)

        send(res, 200, await fetch(req.params.uid))
    } else if (req.query.types) {
        const parsedTypes = req.query.types.split(',')
        console.log(`fetching page ${page} jobs by types ${parsedTypes.join(',')}`)

        const results = filterAndSort(fetch(null, parsedTypes))

        const finalResults = page ?
            paginate(results, {
                page: clamp(page, {min: 1}),
                size: clamp(size, {min: 1, max: 30})
            })
            : results

        const transformed = transformResults(finalResults, {page, size})

        send(res, 200, transformed)
    } else {
        console.log(`fetching page ${page} of all jobs`)

        const results = await filterAndSort(fetch())
        const finalResults = page ?
            paginate(results, {
                page: clamp(page, {min: 1}),
                size: clamp(size, {min: 1, max: 30})
            })
            : results

        const transformed = transformResults(finalResults, {page, size})

        send(res, 200, transformed)
    }
}
