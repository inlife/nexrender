const os   = require('os')
const fs   = require('fs')
const path = require('path')

/* initial data */
const defaultPath = path.join(os.homedir(), 'nexrender')
const defaultName = 'database.js'

const database = process.env.NEXRENDER_DATABASE
    ? process.env.NEXRENDER_DATABASE
    : path.join(defaultPath, defaultName);

let data = (fs.existsSync(database) && fs.readFileSync(database, 'utf8'))
    ? JSON.parse(fs.readFileSync(database, 'utf8'))
    : [];

if (!process.env.NEXRENDER_DATABASE && !fs.existsSync(defaultPath)) {
    fs.mkdirSync(defaultPath);
}

/* internal methods */
const save = () => fs.writeFileSync(database, JSON.stringify(data))

const indexOf = value => {
    for (var i = data.length - 1; i >= 0; i--) {
        const entry = data[i];
        if (entry.uid == value) {
            return i;
        }
    }

    return -1;
}

/* public api */
const fetch = (uid,types = []) => {
    if(uid) {
        return data[indexOf(uid)]
    }

    if(types.length) {
        return data.filter(job => types.includes(job.type))
    }

    return data
}

const count = (uid,types = []) => {
    const data = fetch(uid, types)

    return data.length
}

const insert = entry => {
    const now = new Date()

    entry.updatedAt = now
    entry.createdAt = now

    data.push(entry);
    setImmediate(save);
}

const update = (uid, entry) => {
    const value = indexOf(uid);

    if (value == -1) {
        return null;
    }

    const now = new Date()

    data[value] = Object.assign(
        {}, data[value], entry,
        { updatedAt: now }
    );

    setImmediate(save);
    return data[value];
}

const remove = uid => {
    const value = indexOf(uid);

    if (value === -1) {
        return null;
    }

    data.splice(value, 1)
    setImmediate(save);
    return true;
}

const cleanup = () => {
    data = []
    save()
}

module.exports = {
    insert,
    fetch,
    count,
    update,
    remove,
    cleanup,
}
