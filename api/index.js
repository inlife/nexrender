'use strict';

const assert    = require('assert');
const router    = require('./routers/project');
const Project   = require('./models/project');

let DEFAULT_API_HOST = 'localhost';
let DEFAULT_API_PORT = 3000;

let wrapper = {
    registered: false,

    /**
     * Configuration for api connections
     * @param  {Object} opts
     */
    config: (opts) => {
        var opts = opts || {};

        let host = opts.host || DEFAULT_API_HOST;
        let port = opts.port || DEFAULT_API_PORT;

        this.registered = router.bind(host, port);
    },

    /**
     * Creates new Project object, saves to server's database
     * @param  {Object} data  Plain object for project
     * @return {Promise} 
     */
    create: (data) => {
        if (!this.registered) return console.error('[error] call config method first');

        // setup default params
        data = data || {};

        // check for emptiness plain values
        try {
            assert( data.template );
            assert( data.composition );
        } catch (err) {
            return console.error('[error] provide project properties');
        } 

        // and arrays
        data.assets      = data.assets        || [];
        data.settings    = data.settings      || [];
        data.actions     = data.actions       || [];

        // return promise
        return new Promise((resolve, reject) => {

            // request creation
            router.create(data, (err, res, data) => {

                // parse json
                if (typeof data === 'string') data = JSON.parse(data);
                
                // verify
                if (!err && data && data.template && res.statusCode == 200) {
                    return resolve( new Project(data, wrapper) );
                }

                // notify about error
                reject( err || res.statusMessage );
            });
        });
    },

    /**
     * Get single or multiple entities of Project
     * @optional @param {Number} id 
     * @return {Promise}
     */
    get: (id) => {
        if (!this.registered) return console.error('[error] call config method first');

        // return promise
        return new Promise((resolve, reject) => {

            // if id provided
            if (id) {
                // return single
                router.get(id, (err, res, data) => {
                    // parse json
                    if (typeof data === 'string') data = JSON.parse(data);

                    // verify || notify about error
                    return (err || res.statusCode != 200) ? reject(err || res.statusMessage) : resolve( new Project(data, wrapper) );
                });
            } else {

                // return multiple
                router.getAll((err, res, data) => {
                    if (!res || res.statusCode != 200) return reject( new Error('Error occured during getting list of projects') );

                    // read json
                    let results = []; if (typeof data === 'string') data = JSON.parse(data);

                    // iterate and create objects
                    for (let obj of data) {
                        results.push( new Project( obj, wrapper ) );
                    } 

                    resolve(results);
                });
            }
        });
    },

    /**
     * Update object on server
     * @param  {Object || Project} object
     * @return {Promise}
     */
    update: (object) => {
        if (!this.registered) return console.error('[error] call config method first');
        
        let uobj = object;

        if (object instanceof Project) {
            uobj = object.serialize();
        }

        return new Promise((resolve, reject) => {
            router.update(object.uid, uobj, (err, res, data) => {

                // parse json
                if (typeof data === 'string') data = JSON.parse(data);

                // verify
                if (!err && data && data.template && res.statusCode == 200) {
                    if (object instanceof Project) {
                        return resolve( object.deserialize(data) );
                    } else {
                        return resolve( new Project(data, wrapper) );
                    }
                }

                // notify about error
                reject( err || res.statusMessage );
            });
        });
    },

    /**
     * Remove object from server
     * @param  {Number} id project uid
     * @return {Promise}
     */
    remove: (id) => {
        if (!this.registered) return console.error('[error] call config method first');

        return new Promise((resolve, reject) => {
            router.remove(id, (err, res, data) => {

                // parse json
                if (typeof data === 'string') data = JSON.parse(data);

                // verify || notify about error
                return (err || res.statusCode != 200) ? reject(err || res.statusMessage) : resolve(data);
            });;
        });
    }
};

module.exports = wrapper;
