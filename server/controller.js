'use strict';

const shortid   = require('shortid');
const low       = require('lowdb');
const storage   = require('lowdb/file-sync');

class Controller {
    constructor() {
        this.db = low('db.json', { storage })('projects');
    }

    create(data) {
        data.uid = data.uid || shortid();
        return this.db.push(data);
    }

    get(id) {
        return new Promise((resolve, reject) => {
            return resolve(
                this.db.find( (id) ? { uid: id } : {} )
            );
        });
    }

    update(id, data) {
        return this.db
            .chain()
            .find({ uid: id })
            .assign(data)
            .value();
    }

    delete(id) {

    }
}

module.exports = new Controller;