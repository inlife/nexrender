'use strict';

const fs        = require('fs')
const path      = require('path')
const chai      = require('chai')
const chaiAsFs  = require('chai-fs')
const chaiProm  = require('chai-as-promised')
const exec      = require('child_process').exec

chai.use(chaiAsFs);
chai.use(chaiProm);

global.should = chai.should();

// require module
var rename = require('../../src/tasks/rename.js');

describe('Task: rename', () => {

    let project;
    let settings = { logger: () => {} }

    beforeEach(() => {
        fs.writeFileSync( path.join('test', 'file1src') );
        fs.writeFileSync( path.join('test', 'file2src') );
        fs.writeFileSync( path.join('test', 'file3src') );

        project = {
            workpath: 'test',
            assets: [{
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
        exec('rm -r ' + path.join('test', 'file1src'));
        exec('rm -r ' + path.join('test', 'file2src'));
        exec('rm -r ' + path.join('test', 'file3src'));
        exec('rm -r ' + path.join('test', 'file1dst'));
        exec('rm -r ' + path.join('test', 'file2dst'));
        exec('rm -r ' + path.join('test', 'file3dst'));
    })

    it('should rename each asset file to asset.name', (done) => {
        rename(project, settings).should.be.fulfilled.then(() => {
            path.join('test', 'file1dst').should.be.a.path();
            path.join('test', 'file2dst').should.be.a.path();
            path.join('test', 'file3dst').should.be.a.path();
        }).should.notify(done);
    });

    it('should not rename file if src and dst are the same', (done) => {
        project.assets[0].name = 'file1src';

        rename(project, settings).should.be.fulfilled.then(() => {
            path.join('test', 'file1src').should.be.a.path();
            path.join('test', 'file2dst').should.be.a.path();
            path.join('test', 'file3dst').should.be.a.path();
        }).should.notify(done);
    });

    it('should overwrite file if it already exists', (done) => {
        fs.writeFileSync( path.join('test', 'file2dst') );

        rename(project, settings).should.be.fulfilled.then(() => {
            path.join('test', 'file1dst').should.be.a.path();
            path.join('test', 'file2dst').should.be.a.path();
            path.join('test', 'file3dst').should.be.a.path();
        }).should.notify(done);
    });
});
