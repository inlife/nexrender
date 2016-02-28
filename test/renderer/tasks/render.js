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
var render = rewire('../../../renderer/tasks/render.js');

describe('Task: render', () => {

    process.env.AE_BINARY = 'aetestrender'    
    let project;
    let spawned;
    let code, ldata, lerrors;
    let cbs = {
        out: null,
        err: null,
        cls: null
    };

    before(() => {
        render.__set__('spawn', (name, args) => {
            spawned = {
                name: name,
                args: args,
                stdout: { on: (a, b) => {cbs.out = b} },
                stderr: { on: (a, b) => {cbs.err = b} },
                on: (a, b) => {cbs.cls = b}
            };

            setTimeout(() => {
                cbs.out(ldata);
                cbs.err(lerrors);
                cbs.cls(code);
            }, 100);

            return spawned;
        });
    });

    beforeEach(() => {
        code = 0;
        ldata  = '';
        lerrors = '';

        project = { 
            workpath: 'test',
            composition: 'mycomp',
            template: 'work'
        };
    });

    afterEach(() => {
        delete process.env.AE_MULTIFRAMES;
        delete process.env.AE_MEMORY;
    });

    it('should fallback to default out extension', (done) => {
        code = 0;

        render(project).should.be.fulfilled.then((prj) => {
            prj.should.have.property('resultname').and.be.eql('result.mp4') 
        }).should.notify(done);
    });

    it('should set extension if its provided', (done) => {
        code = 0;
        project.settings = { outputExt: 'tst' };

        render(project).should.be.fulfilled.then(() => {
            project.should.have.property('resultname').and.be.eql('result.tst');
        }).should.notify(done);
    });

    it('should form basic spawn request', (done) => {
        code = 0;

        render(project).should.be.fulfilled.then(() => {
            spawned.name.should.be.equal('aetestrender');
            spawned.args.should.be.deep.equal([
                '-comp',    'mycomp',
                '-project', path.join( process.cwd(), 'test', 'work' ),
                '-output',  path.join( process.cwd(), 'test', 'result.mp4' ) 
            ]);
        }).should.notify(done);
    });

    it('should set custom settings, if they are provided', (done) => {
        code = 0;
        project.settings = {
            outputModule: 'testformat',
            renderSettings: 'testtemplate',
            startFrame: 231,
            endFrame: 12312312,
            incrementFrame: 1
        }

        render(project).should.be.fulfilled.then(() => {
            spawned.name.should.be.equal('aetestrender');
            spawned.args.should.be.deep.equal([
                '-comp',    'mycomp',
                '-project', path.join( process.cwd(), 'test', 'work' ),
                '-output',  path.join( process.cwd(), 'test', 'result.mp4' ),
                '-OMtemplate', 'testformat',
                '-RStemplate', 'testtemplate',
                '-s', 231,
                '-e', 12312312,
                '-i', 1,
            ]);
        }).should.notify(done);
    });

    it('should set multiframe rendering option if its provided', (done) => {
        process.env.AE_MULTIFRAMES = true;
        code = 0;

        render(project).should.be.fulfilled.then(() => {
            spawned.name.should.be.equal('aetestrender');
            spawned.args.should.be.deep.equal([
                '-comp',    'mycomp',
                '-project', path.join( process.cwd(), 'test', 'work' ),
                '-output',  path.join( process.cwd(), 'test', 'result.mp4' ),
                '-mp'
            ]);
        }).should.notify(done);
    });

    it('should set memory setting if its provided', (done) => {
        process.env.AE_MEMORY = '25 100';
        code = 0;

        render(project).should.be.fulfilled.then(() => {
            spawned.name.should.be.equal('aetestrender');
            spawned.args.should.be.deep.equal([
                '-comp',    'mycomp',
                '-project', path.join( process.cwd(), 'test', 'work' ),
                '-output',  path.join( process.cwd(), 'test', 'result.mp4' ),
                '-mem_usage', 25, 100
            ]);
        }).should.notify(done);
    });

    it('should raise error if memory format is incorrect', (done) => {
        process.env.AE_MEMORY = '50';
        code = 0;

        render(project).should.be.rejected.then().should.notify(done);
    });

    it('should add output to log', (done) => {
        code = 1; // error
        ldata = 'some log data from\n aerender process';
        lerrors = 'some error log\n data also';

        render(project).should.be.rejected.then((data) => {
            data.should.be.equal(ldata + lerrors);
        }).should.notify(done);
    });
});
