const redis = require('redis');
const { filterAndSortJobs } = require('@create-global/nexrender-core')

const client = redis.createClient({
    url: process.env.REDIS_URL
})

client.on('error', (err) => console.log('Redis Client Error', err))
client.connect()

/* internal methods */
const scan = async parser => {
    const scanIterator =  client.scanIterator({
        TYPE: 'string',
        MATCH: 'nexjob:*',
        COUNT: 10
    })

    const keys = [];
    for await (const key of scanIterator) {
        keys.push(key)
    }

    return Promise.all(keys.map(parser))
}

/* public api */
const insert = async entry => {
    const now = new Date()

    entry.updatedAt = now
    entry.createdAt = now

    await client.set(`nexjob:${entry.uid}`, JSON.stringify(entry))
}

const fetch = async (uid, types = []) => {
    if (uid) {
        const entry = await client.get(`nexjob:${uid}`)
        return JSON.parse(entry)
    } else {
        const results = await scan(async (result) => {
            const value = await client.get(result)
            return JSON.parse(value)
        })

        return filterAndSortJobs(results, types)
    }
}

const update = async (uid, object) => {
    const key = `nexjob:${uid}`;
    return client.executeIsolated(async isolatedClient => {
        await isolatedClient.watch(key)

        const multi = isolatedClient.multi()
        const entry = JSON.parse(await isolatedClient.get(key))

        const updatedEntry = Object.assign(
            {}, entry, object, { updatedAt: new Date() }
        )

        multi.set(key, JSON.stringify(updatedEntry))

        await multi.exec()

        return updatedEntry
    })
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
