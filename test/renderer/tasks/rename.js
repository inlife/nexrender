'use strict';

const chai      = require('chai');
const chaiAsFs  = require('chai-fs');
const chaiProm  = require('chai-as-promised');
const fs        = require('fs-extra');
const path      = require('path');

chai.use(chaiAsFs);
chai.use(chaiProm);

global.should = chai.should();

// require module
var rename = require('../../../renderer/tasks/rename.js');

describe('Task: rename', () => {

    let project;

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
        fs.removeSync( path.join('test', 'file1src') );
        fs.removeSync( path.join('test', 'file2src') );
        fs.removeSync( path.join('test', 'file3src') );
        fs.removeSync( path.join('test', 'file1dst') );
        fs.removeSync( path.join('test', 'file2dst') );
        fs.removeSync( path.join('test', 'file3dst') );
    })

    it('should rename each asset file to asset.name', (done) => {
        rename(project).should.be.fulfilled.then(() => {
            path.join('test', 'file1dst').should.be.a.path();
            path.join('test', 'file2dst').should.be.a.path();
            path.join('test', 'file3dst').should.be.a.path();
        }).should.notify(done);
    });

    it('should not rename file if src and dst are the same', (done) => {
        project.assets[0].name = 'file1src';

        rename(project).should.be.fulfilled.then(() => {
            path.join('test', 'file1src').should.be.a.path();
            path.join('test', 'file2dst').should.be.a.path();
            path.join('test', 'file3dst').should.be.a.path();
        }).should.notify(done);
    });

    it('should overwrite file if it already exists', (done) => {
        fs.writeFileSync( path.join('test', 'file2dst') );

        rename(project).should.be.fulfilled.then(() => {
            path.join('test', 'file1dst').should.be.a.path();
            path.join('test', 'file2dst').should.be.a.path();
            path.join('test', 'file3dst').should.be.a.path();
        }).should.notify(done);
    });
});
