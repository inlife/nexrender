'use strict';

const fs        = require('fs')
const path      = require('path')
const exec      = require('child_process').exec
const chai      = require('chai')
const chaiAsFs  = require('chai-fs')
const chaiProm  = require('chai-as-promised')

chai.use(chaiAsFs);
chai.use(chaiProm);

global.should = chai.should();

// require module
var rename = require('../../src/tasks/rename.js');

describe('Task: rename', () => {
    let job;
    let settings = { logger: () => {} }

    beforeEach(() => {
        fs.writeFileSync( path.join(__dirname, 'file1src') );
        fs.writeFileSync( path.join(__dirname, 'file2src') );
        fs.writeFileSync( path.join(__dirname, 'file3src') );

        job = {
            workpath: __dirname,
            files: [{
                src: 'url/file1src',
                name: 'file1dst'
            }, {
                src: 'url/file2src',
                name: 'file2dst'
            }, {
                src: 'url/file3src?q=test',
                name: 'file3dst'
            }]
        }
    });

    afterEach(() => {
        exec('rm -r ' + path.join(__dirname, 'file1src'));
        exec('rm -r ' + path.join(__dirname, 'file2src'));
        exec('rm -r ' + path.join(__dirname, 'file3src'));
        exec('rm -r ' + path.join(__dirname, 'file1dst'));
        exec('rm -r ' + path.join(__dirname, 'file2dst'));
        exec('rm -r ' + path.join(__dirname, 'file3dst'));
    })

    it('should rename each asset file to asset.name', (done) => {
        rename(job, settings).should.be.fulfilled.then(() => {
            path.join(__dirname, 'file1dst').should.be.a.path();
            path.join(__dirname, 'file2dst').should.be.a.path();
            path.join(__dirname, 'file3dst').should.be.a.path();
        }).should.notify(done);
    });

    it('should not rename file if src and dst are the same', (done) => {
        job.files[0].name = 'file1src';

        rename(job, settings).should.be.fulfilled.then(() => {
            path.join(__dirname, 'file1src').should.be.a.path();
            path.join(__dirname, 'file2dst').should.be.a.path();
            path.join(__dirname, 'file3dst').should.be.a.path();
        }).should.notify(done);
    });

    it('should overwrite file if it already exists', (done) => {
        fs.writeFileSync( path.join(__dirname, 'file2dst') );

        rename(job, settings).should.be.fulfilled.then(() => {
            path.join(__dirname, 'file1dst').should.be.a.path();
            path.join(__dirname, 'file2dst').should.be.a.path();
            path.join(__dirname, 'file3dst').should.be.a.path();
        }).should.notify(done);
    });
});
