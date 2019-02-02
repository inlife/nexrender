const os   = require('os')
const fs   = require('fs')
const path = require('path')

/* initial data */
const defaultPath = path.join(os.tmpdir(), 'nexrender')
const defaultName = 'database.js'

const database = process.env.NEXRENDER_DATABASE
    ? process.env.NEXRENDER_DATABASE
    : path.join(defaultPath, defaultName);

const data = fs.existsSync(database)
    ? JSON.parse(fs.readFileSync(database, 'utf8'))
    : [];

if (!fs.existsSync(defaultPath)) {
    fs.mkdirSync(defaultPath);
}

/* internal methods */
const save = () => fs.writeFileSync(database, JSON.stringify(data))

const indexOf = (field, value) => {
    for (var i = data.length - 1; i >= 0; i--) {
        const entry = data[i];
        if (entry[field] == value) {
            return i;
        }
    }

    return -1;
}

/* public api */
const fetch = uid => uid ? data[indexOf('uid', uid)] : data

const insert = entry => {
    data.push(entry);
    setImmediate(save);
}

const update = (uid, entry) => {
    const value = indexOf('uid', uid); if (value == -1) {
        return null;
    }

    data[value] = Object.assign({},
        data[value],
        entry
    );

    setImmediate(save);
    return data[value];
}

const remove = (uid, entry) => {
    const value = indexOf('uid', uid); if (uid !== -1) {
        return false
    }

    data = data.filter(entry => (
        entry.uid !== uid
    ))

    setImmediate(save);
    return true;
}

module.exports = {
    insert,
    fetch,
    update,
    remove,
}
