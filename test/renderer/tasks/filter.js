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
var filter = require('../../../renderer/tasks/filter.js');

describe('Task: filter', () => {

    let project;

    beforeEach(() => {
        fs.copySync( path.join('test', 'res', 'img.jpg'), path.join('test', '1.jpg') );
        fs.copySync( path.join('test', 'res', 'img.jpg'), path.join('test', '2.jpg') );

        project = {
            workpath: 'test',
            assets: [{
                type: 'image',
                name: '1.jpg',
                filters: [{ name: 'cover', params: [100, 100] }]
            }]
        }
    });

    afterEach(() => {
        fs.removeSync( path.join('test', '1.jpg') );
        fs.removeSync( path.join('test', '2.jpg') );
    });


    it('should not raise errors if there is nothing to process', () => {
        project.assets = [];
        filter(project).should.be.fulfilled;
    })

    it('should skip all non-image and empty-filter assets', (done) => {
        project.assets.push({ type: 'audio' }, { type: 'image' });

        filter(project).should.be.fulfilled.then(() => {
            path.join('test', '1.jpg').should.be.a.path();
        }).should.notify(done);
    });

    it('should process image assets with one or more filters', (done) => {
        project.assets.push({
            type: 'image',
            name: '2.jpg',
            filters: [
                { name: 'cover', params: [100, 100] },
                { name: 'flip', params: [true, false] }
            ]
        });

        filter(project).should.be.fulfilled.then(() => {
            path.join('test', '1.jpg').should.be.a.path();
            path.join('test', '2.jpg').should.be.a.path();
        }).should.notify(done);
    });

    it('should set default params for filter', (done) => {
        project.assets.push({
            type: 'image',
            name: '2.jpg',
            filters: [ { name: 'invert' }]
        });

        filter(project).should.be.fulfilled.then(() => {
            path.join('test', '1.jpg').should.be.a.path();
            path.join('test', '2.jpg').should.be.a.path();
        }).should.notify(done);
    });

    it('should not raise errors if not existent filter applied', (done) => {
        project.assets.push({
            type: 'image',
            name: '2.jpg',
            filters: [
                { name: 'cover', params: [100, 100] },
                { name: 'notexists', params: [true, false] }
            ]
        });

        filter(project).should.be.fulfilled.then(() => {
            path.join('test', '1.jpg').should.be.a.path();
            path.join('test', '2.jpg').should.be.a.path();
        }).should.notify(done);
    });


    it('should raise error if there no params needed for filter', () => {
        project.assets.push({
            type: 'image',
            name: '2.jpg',
            filters: [ { name: 'flip' }]
        });

        filter(project).should.be.rejected;
    });
});
