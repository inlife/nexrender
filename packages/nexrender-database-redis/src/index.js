const redis = require('redis')
const {promisify} = require('util')
const { filterAndSort } = require('@create-global/nexrender-core')

const client = redis.createClient({
    url: process.env.REDIS_URL
})

client.getAsync = promisify(client.get).bind(client)
client.setAsync = promisify(client.set).bind(client)
client.delAsync = promisify(client.del).bind(client)
client.scanAsync = promisify(client.scan).bind(client)

/* internal methods */
const scan = async parser => {
    let cursor = '0'
    let results = []

    const _scan = async () => {
        const [next, keys] = await client.scanAsync(cursor, 'MATCH', 'nexjob:*', 'COUNT', '10')

        cursor = next
        results = results.concat(keys)

        if (cursor === '0') {
            results = await results.map(parser).filter(e => e !== null && e !== undefined)
            return results
        } else {
            return _scan(parser)
        }
    }

    await _scan(parser)

    return Promise.all(results)
}

/* public api */
const insert = async entry => {
    const now = new Date()

    entry.updatedAt = now
    entry.createdAt = now

    await client.setAsync(`nexjob:${entry.uid}`, JSON.stringify(entry))
}

const fetch = async (uid, types = []) => {
    if (uid) {
        const entry = await client.getAsync(`nexjob:${uid}`)
        return JSON.parse(entry)
    } else {
        const results = await scan(async (result) => {
            const value = await client.getAsync(result)
            return JSON.parse(value)
        })

        return filterAndSort(results, types)
    }
}

const update = async (uid, object) => {
    const now = new Date()
    let entry = await fetch(uid)

    entry = Object.assign(
        {}, entry, object,
        {updatedAt: now}
    )

    await client.setAsync(`nexjob:${uid}`, JSON.stringify(entry))
    return entry
}

const remove = async uid => {
    await client.del(`nexjob:${uid}`)
    return true
}

const cleanup = () => {
    return scan(async (result) => {
        return await client.del(result)
    })
}

module.exports = {
    insert,
    fetch,
    update,
    remove,
    cleanup,
}
