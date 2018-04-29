'use strict'

const path      = require('path')
const assert    = require('assert')

/* special mock for fetch method */
global.__fetch_mock = (a, b) => {
    return Promise.resolve({ ok: true, json: () => {} })
}

// require module
const api = require('../src/index.js');

describe('Testing @nexrender/api', () => {

    describe('#config()', () => {
        it('should fallback to default configuration without provided data', () => {
            let client = api.create();
            assert(client.host == 'http://localhost:3000/api')
        });

        it('should call config connection with provided port, host and protocol', () => {
            let client = api.create({ scheme: 'https', host: '127.0.1.100', port: 3322 });
            assert(client.host == 'https://127.0.1.100:3322/api')
        });
    });

    describe('#create()', () => {
        let jobs = api.create().jobs;

        it('should raise error if template or composition fields were not provided', (done) => {
            jobs.create()
                .then(a => done(new Error()))
                .catch(a => done())
        });

        it('should send request to create object with basic params', (done) => {
            jobs.create({ template: 'a', composition: 'b' })
                .then(data => data ? done() : done(new Error()))
                .catch(done)
        });
    });
});
