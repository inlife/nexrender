'use strict';

const fs        = require('fs')
const path      = require('path')
const exec      = require('child_process').exec
const chai      = require('chai')
const chaiAsFs  = require('chai-fs')

chai.use(chaiAsFs);

global.should = chai.should();

// override paths for test folder
process.env.TEMP_DIRECTORY = path.join(__dirname, 'temp');

// require module
var setup = require('../../src/tasks/setup.js');

describe('Task: setup', () => {

    let job = {
        uid: 'mytestid',
        template: 'job.aepx',
        assets: []
    };

    const settings = {
        workpath: path.join(__dirname, 'temp'),
        logger: () => {},
    }

    let cperror = undefined;

    beforeEach((done) => {
        setup(job, settings).then((proj) => {
            job = proj; done();
        }).catch((err)=> {
            cperror = err; done();
        });
    });

    afterEach(() => {
        exec('rm -r ' + path.join(__dirname, 'temp'));
    });

    it('should set job\'s workpath', () => {
        job.should.have.property('workpath').and.equal(
            path.join(__dirname, 'temp', 'mytestid')
        );
    });

    describe('(with job-as-asset)', () => {
        before(() => {
            job.assets.push({
                name: 'job.aepx',
                type: 'job'
            });
        })

        it('should not copy job if job asset is provided', () => {
            path.join(__dirname, 'temp', 'mytestid', 'job.aep').should.not.be.a.path();
        });

        it('should set job.template to asset.name', () => {
            job.template.should.be.eql('job.aepx');
        });
    });
});
