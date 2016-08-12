'use strict';
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

process.env.API_REQUEST_INTERVAL = 10;

// require module
var renderer = rewire('../../renderer/index.js');

describe('Testing renderer', () => {

    describe('Testing tasks', () => {
        require('./tasks/setup');
        require('./tasks/download');
        require('./tasks/rename');
        require('./tasks/filter');
        require('./tasks/patch');
        require('./tasks/render');
        require('./tasks/verify');
        // require('./tasks/actions');
        require('./tasks/cleanup');
    });

    describe('Testing actions', () => {
        //TODO
    });

    describe('Testing renderer methods', () => {
        let projects;
        let hostopts;

        before(() => {
            renderer.__set__('api', {
                config: (opts) => { hostopts = opts; },
                get: () => { return projects }
            });
        });

        describe('#applyTasks()', () => {

            it('should be rejected if task returened error', (done) => {
                let project = {
                    prepare: () => { return Promise.reject(new Error('message')); },
                    failure: () => { return Promise.resolve(); }
                };

                renderer.__get__('applyTasks')(project, null, () => { done() });
            });
        });

        describe('#requestNextProject()', () => {
            
            it('should reject if projects were not found', (done) => {
                projects = new Promise((f, r) => { f([]) });

                renderer.__get__('requestNextProject')().should.be.rejected.notify(done);
            });

            it('should reject if api returned an error', (done) => {
                projects = new Promise((f, r) => { r(new Error()) })

                renderer.__get__('requestNextProject')().should.be.rejected.notify(done);
            });

            it('should reject if projects were found, but have no queued state in them', (done) => {
                projects = new Promise((f, r) => { f([
                    { state: 'test' }, { state: 'test2' }
                ])});

                renderer.__get__('requestNextProject')().should.be.rejected.notify(done);
            });

            it('should resolve if at least one queued project was found', (done) => {
                projects = new Promise((f, r) => { f([
                    { state: 'test' }, { state: 'queued' }, { state: 'queued' }
                ])});

                renderer.__get__('requestNextProject')().should.be.fulfilled.notify(done);
            });

        });

        describe('#startRender()', () => {
            let result;
            
            before(() => {
                renderer.__set__('applyTasks', (a,f,r) => { result?f():r() });
            });

            it('should reject if task returned error', (done) => {
                result = false;
                renderer.__get__('startRender')({}).should.be.rejected.notify(done);
            });

            it('should fulfil if task returned error', (done) => {
                result = true;
                renderer.__get__('startRender')({}).should.be.fulfilled.notify(done);
            });
        });

        describe('#startRecursion()', () => {
            
            it('should restart recursion after timeout', (done) => {
                let counter = 0;

                renderer.__set__('requestNextProject', () => {
                    return new Promise((f,r) => {
                        if (counter > 5) {
                            renderer.__set__('setTimeout', (cb, time) => {
                                setTimeout(() => { done() }, time) 
                            })
                        }

                        r(); counter++;
                    });
                });

                renderer.__get__('startRecursion')();
            });

            it('should start project rendering and goto next after that', (done) => {
                let counter = 0;

                renderer.__set__('startRender', () => {
                    return new Promise((f,r) => {
                        if (counter < 5) {
                            f(); counter++;
                        } else {
                            return done();
                        }
                    });
                });

                renderer.__set__('requestNextProject', () => {
                    return new Promise((f,r) => {f()});
                });

                renderer.__get__('startRecursion')();
            });

            it('should goto next project if previous failed', (done) => {
                let counter = 0;

                renderer.__set__('startRender', () => {
                    return new Promise((f,r) => {
                        if (counter < 5) {
                            r(); counter++;
                        } else {
                            return done();
                        }
                    });
                });

                renderer.__set__('requestNextProject', () => {
                    return new Promise((f,r) => {f()});
                });

                renderer.__get__('startRecursion')();
            });
        });

        describe('#start()', () => {
            beforeEach(() => {
                hostopts = [];
            });

            it('should configurate everthing using provided options', () => {
                renderer.__set__('startRecursion', () => {});
                renderer.__get__('start')({
                    host: 'somelocalhost',
                    port: 3002,
                    aerender: 'testpath',
                    multiframes: true,
                    memory: '12 265'
                });

                hostopts.should.be.deep.equal({
                    host: 'somelocalhost',
                    port: 3002
                });

                process.env.AE_BINARY.should.be.equal('testpath');
                process.env.AE_MULTIFRAMES.should.be.eql('true');
                process.env.AE_MEMORY.should.be.equal('12 265');
            });

            it('should configurate everthing without options', () => {
                renderer.__set__('startRecursion', () => {});
                renderer.__get__('start')();

                hostopts.should.be.deep.equal({
                    host: null,
                    port: null
                });

                process.env.AE_BINARY.should.be.empty;
                process.env.AE_MULTIFRAMES.should.be.empty;
                process.env.AE_MEMORY.should.be.empty;
            });
        });
    });
});
