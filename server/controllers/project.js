'use strict';

const shortid   = require('shortid');
const low       = require('lowdb');
const storage   = require('lowdb/file-sync');

const SERVER_DB_PATH = process.env.SERVER_DB_PATH || 'db.json';

let initialized = false;

class Controller {

    /**
     * Called on loading, creates db connection
     * Binds methods
     */
    initialize() {
        initialized = true;

        // load file sync database
        this.db = low(SERVER_DB_PATH, { storage })('projects');

        // bind useful findAll method
        this.db.findAll = function(query) {
            var query = query || {};

            if (query.uid) {
                return this.find( query );
            }

            return this.chain().filter( query ).value().filter( n => n !== null );
        };
    }

    /**
     * Called on POST request
     * @param  {Object} data JSON project
     * @return {Promise}
     */
    create(data) {
        if (!initialized) this.initialize();

        // set default data
        data.uid = data.uid || shortid();
        data.state = data.state || 'queued';
        data.createdAt = new Date;
        data.updatedAt = new Date;

        // save data
        this.db.push(data);

        // return promise and get last added project
        return new Promise((resolve, reject) => {
            resolve( this.db.last() );
        });
    }

    /**
     * Called on GET request
     * @optional @param {Number} id Project uid
     * @return {Promise}
     */
    get(id) {
        if (!initialized) this.initialize();
        
        // get project by id, or get all items if id not provided
        return new Promise((resolve, reject) => {
            resolve( this.db.findAll( id ? { uid: id } : {} ) || reject( {} ) );
        });
    }

    /**
     * Called on PUT request
     * @param {Number} id Project uid
     * @param  {Object} data JSON project
     * @return {Promise}
     */
    update(id, data) {
        if (!initialized) this.initialize();
        
        // set default data
        data.updatedAt = new Date;

        // update data and return
        return new Promise((resolve, reject) => {
            resolve( this.db.chain().find({ uid: id }).assign( data ).value() );
        });
    }

    /**
     * Called on DELETE request
     * @param  {Number} id Project uid
     * @return {Promise}
     */
    delete(id) {
        if (!initialized) this.initialize();
        
        // remove project by id
        return new Promise((resolve, reject) => {
            resolve( this.db.remove({ uid : id }) );
        });
    }
}

module.exports = new Controller;
