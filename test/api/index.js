'use strict';

const chai      = require('chai');
const chaiAsFs  = require('chai-fs');
const chaiProm  = require('chai-as-promised');
const fs        = require('fs-extra');
const path      = require('path');
const rewire    = require('rewire');

chai.use(chaiAsFs);
chai.use(chaiProm);

global.should = chai.should();

// require module
var api = rewire('../../api/index.js');

describe('Testing api', () => {
    let data;

    before(() => {
        api.__set__('router.bind', (h, p) => {data.host = h; data.port = p; return true});
        api.__set__('Project', function(dt) { this.data = dt; });
    });

    describe('#config()', () => {
        beforeEach(() => {
            data = {};
            api.__set__('wrapper.registered', false);
        });

        it('should call config connection with provided port, host', () => {
            api.config({ host: '127.0.1.100', port: 3322 });
            api.__get__('wrapper.registered').should.be.true;
            data.host.should.be.eql('127.0.1.100');
            data.port.should.be.eql(3322);
        });

        it('should fallback to default configuration without provided data', () => {
            api.config();
            api.__get__('wrapper.registered').should.be.true;
            data.host.should.be.eql('localhost');
            data.port.should.be.eql(3000);
        });
    });

    describe('#create()', () => {
        before(() => {
            api.__set__('wrapper.registered', false);
        });

        beforeEach(() => {
            data = {};
        });

        it('should raise error if not configured', (done) => {
            api.create().should.be.rejected.notify(done)
        });

        it('should raise error if template or composition fields were not provided', (done) => {
            api.__set__('wrapper.registered', true);
            api.create().should.be.rejected.notify(done);
        });

        it('should send request to create object with basic params', (done) => {
            api.__set__('router.create', (dt, cb) => { data = dt; cb(null, {statusCode: 200}, dt) });

            api.create({ template: 'a', composition: 'b' }).should.be.fulfilled.then(() => {
                data.should.not.be.empty;
            }).should.notify(done);
        });

        it('should send request to create object with all params', (done) => {
            api.__set__('router.create', (dt, cb) => { data = dt; cb(null, {statusCode: 200}, dt) });

            api.create({
                template: 'a',
                composition: 'b',
                assets: [{ name: 'asset1' }],
                settings: { endFrame: 133 },
                actions: [{ name: 'action1' }]
            }).should.be.fulfilled.then(() => {
                data.should.not.be.empty;
                data.should.be.deep.equal({
                    template: 'a',
                    composition: 'b',
                    assets: [{ name: 'asset1' }],
                    settings: { endFrame: 133 },
                    actions: [{ name: 'action1' }]
                });
            }).should.notify(done);
        });

        it('should parse returned data if it was json', (done) => {
            api.__set__('router.create', (dt, cb) => { data = dt; cb(null, {statusCode: 200}, JSON.stringify(dt)) });

            api.create({ template: 'a', composition: 'b' }).should.be.fulfilled.then((project) => {
                project.should.be.deep.equal({ data: {
                    template: 'a',
                    composition: 'b',
                    assets: [],
                    settings: {},
                    actions: []
                }});
            }).should.notify(done);
        });

        it('should properly handle errors', (done) => {
            api.__set__('router.create', (dt, cb) => { data = dt; cb(new Error('err')) });
            api.create({ template: 'a', composition: 'b' }).should.be.rejected.notify(done);
        });

        it('should raise error if returned data is empty', (done) => {
            api.__set__('router.create', (dt, cb) => { cb(null, {statusCode: 200}, null) });
            api.create({ template: 'a', composition: 'b' }).should.be.rejected.notify(done);
        });

        it('should raise error if returned data does not have template', (done) => {
            api.__set__('router.create', (dt, cb) => { cb(null, {statusCode: 200}, { nottemplate: 'asd' }) });
            api.create({ template: 'a', composition: 'b' }).should.be.rejected.notify(done);
        });

        it('should raise error if returned statusCode is wrong', (done) => {
            api.__set__('router.create', (dt, cb) => { cb(null, {statusCode: 400}, { template: 'asd' }) });
            api.create({ template: 'a', composition: 'b' }).should.be.rejected.notify(done);
        });
    });

    describe('#get()', () => {
        before(() => {
            api.__set__('wrapper.registered', false);
        });

        beforeEach(() => {
            data = {};
        });

        it('should raise error if not configured', (done) => {
            api.get().should.be.rejected.notify(done);
        });

        it('should ', (done) => {
            api.__set__('wrapper.registered', true);
            //apig.et
        });
    });
});
