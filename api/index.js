'use strict';

const Client    = require('node-rest-client').Client;
const assert    = require('assert');
const router    = require('./router');
const packdata  = require('./packdata');
const Project   = require('./project');

let client = new Client();

let API_HOST = 'localhost';
let API_PORT = 3000;

let wrapper = {
    registered: false,

    config: (opts) => {
        var opts = opts || {};

        let host = opts.host || API_HOST;
        let port = opts.port || API_PORT;

        this.registered = router.bind(client, host, port);
    },

    create: (data) => {
        if (!this.registered) return console.error('[error] call config method first');

        // setup default params
        data = data || {};

        try {
            assert( data.template );
            assert( data.composition );
        } catch (err) {
            return console.error('[error] provide project properties');
        } 

        data.assets      = data.assets        || [];
        data.settings    = data.settings      || [];
        data.postActions = data.postActions   || [];

        // return promise
        return new Promise((resolve, reject) => {

            // request creation
            client.methods.create( packdata( data ), (data, res) => {
                if (data && data.template) {
                    return resolve( new Project(data) );
                }

                reject( data );
            });
        });
    },

    get: () => {
        if (!this.registered) return console.log('call config method first');
    }
};

module.exports = wrapper;