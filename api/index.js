'use strict';

const Client    = require('node-rest-client').Client;
const assert    = require('assert');
const router    = require('./router');
const packdata  = require('./packdata');
const Project   = require('./project');

let client = null;

let API_HOST = 'localhost';
let API_PORT = 3000;

let wrapper = {
    registered: false,

    /**
     * Configuration for api connections
     * @param  {Object} opts
     */
    config: (opts) => {
        var opts = opts || {};

        let host = opts.host || API_HOST;
        let port = opts.port || API_PORT;

        client = new Client();

        this.registered = router.bind(client, host, port);
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
        data.postActions = data.postActions   || [];

        // return promise
        return new Promise((resolve, reject) => {

            // request creation
            client.methods.create( packdata( data ), (data, res) => {
                if (data && data.template && res.statusCode == 200) {
                    return resolve( new Project(data, wrapper) );
                }

                reject( res.statusMessage );
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

            // request creation
            if (id) {
                client.methods.get( packdata( {}, id ), (data, res) => {
                    return (res.statusCode != 200) ? 
                        reject( res.statusMessage ) : 
                        resolve( new Project( data, wrapper ) );
                });
            } else {
                client.methods.getAll({}, (data, res) => {
                    if (res.statusCode != 200) {
                        return reject( res.statusMessage );
                    }
                    let results = [];

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
        
        let data = object;

        if (object instanceof Project) {
            data = object.serialize();
        }

        return new Promise((resolve, reject) => {
            client.methods.update( packdata( data, object.uid ), (data, res) => {

                if (data && data.template && res.statusCode == 200) {
                    if (object instanceof Project) {
                        return resolve( object.deserialize(data) );
                    } else {
                        return resolve( new Project(data, wrapper) );
                    }
                }

                reject( res.statusMessage );
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
            client.methods.remove( packdata( {}, id ), (data, res) => {
                return (res.statusCode != 200) ? reject(res.statusMessage) : resolve(data);
            });;
        });
    }
};

module.exports = wrapper;
