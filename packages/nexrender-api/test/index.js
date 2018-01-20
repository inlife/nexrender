'use strict'

const path      = require('path')
const chai      = require('chai')
const chaiAsFs  = require('chai-fs')
const chaiProm  = require('chai-as-promised')

chai.use(chaiAsFs)
chai.use(chaiProm)

global.should = chai.should()

/* special mock for fetch method */
global.__fetch_mock = (a, b) => {
    return Promise.resolve({ ok: true, json: () => {} })
}

// require module
const api = require('../src/index.js');

describe('Testing api', () => {

    describe('#config()', () => {
        it('should fallback to default configuration without provided data', () => {
            let client = api.create();
            client.host.should.be.eql('http://localhost:3000/api');
        });

        it('should call config connection with provided port, host and protocol', () => {
            let client = api.create({ scheme: 'https', host: '127.0.1.100', port: 3322 });
            client.host.should.be.eql('https://127.0.1.100:3322/api');
        });
    });

    describe('#create()', () => {
        let projects = api.create().projects;

        it('should raise error if template or composition fields were not provided', (done) => {
            projects.create().should.be.rejected.notify(done);
        });

        it('should send request to create object with basic params', (done) => {
            projects.create({ template: 'a', composition: 'b' }).should.be.fulfilled.then((data) => {
                data.should.not.be.empty;
            }).should.notify(done);
        });
    });
});
