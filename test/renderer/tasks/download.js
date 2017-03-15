'use strict';

const chai      = require('chai');
const chaiAsFs  = require('chai-fs');
const fs        = require('fs-extra');
const path      = require('path');
const express   = require('express');

chai.use(chaiAsFs);

global.should = chai.should();

// require module
var download = require('../../../renderer/tasks/download.js');

describe('Task: download', () => {

    describe('remote file', () => {
        let app = express();
        let server = null;
        let cperror = undefined;
        let project = {
            uid: 'mytestid',
            template: 'project.aep',
            workpath: 'test',
            assets: [{
                type: 'project',
                src: 'http://localhost:3322/proj.aep',
                name: 'proj.aep'
            }, {
                type: 'image',
                src: 'http://localhost:3322/image.jpg'
            }]
        };

        before((done) => {
            fs.mkdirSync( path.join('test', 'public') );
            fs.writeFileSync( path.join('test', 'public', 'proj.aep'), 'dummy');
            fs.writeFileSync( path.join('test', 'public', 'image.jpg'), 'dummy');

            app.use( express.static( path.join('test', 'public') ));
            server = app.listen(3322, done);
        });

        after(() => {
            fs.removeSync( path.join('test', 'public') );
            server.close();
        });

        beforeEach((done) => {
            download(project).then((proj) => {
                project = proj; done();
            }).catch((err) => {
                cperror = err;
                setTimeout(done, 100);
            });
        });

        afterEach(() => {
            fs.unlinkSync( path.join('test', 'proj.aep') );
            fs.unlinkSync( path.join('test', 'image.jpg') );
        });

        it('should download each asset', () => {
            path.join('test', 'proj.aep').should.be.a.path();
            path.join('test', 'image.jpg').should.be.a.path();
        });

        it('should set project.template to asset.name if its project', () => {
            project.template.should.be.eql('proj.aep');
        });

        describe('(with file 404)', () => {
            before(() => {
                project.assets.push({
                    type: 'audio',
                    src: 'http://localhost:3322/notfound.mp3'
                });
            });

            it('should throw error if file cannot be downloaded', () => {
                cperror.should.not.be.undefined;
            });
        });
    });

    describe('local file', () => {
        const assetsDir = path.join('test', 'assets')
        let project = {
            uid: 'mytestid',
            template: 'project.aep',
            workpath: 'test',
            assets: [{
                type: 'project',
                src: path.join(assetsDir, 'proj.aep'),
                name: 'proj.aep'
            }, {
                type: 'image',
                src: path.join(assetsDir, 'image.jpg')
            }]
        };

        before(() => {
            fs.mkdirSync( assetsDir );
            project.assets.forEach((asset) => {
                fs.writeFileSync(asset.src, 'dummy');
            });
        });

        after(() => {
            fs.removeSync( assetsDir );
        });

        beforeEach((done) => {
            download(project).then((proj) => {
                project = proj; done();
            });
        });

        afterEach(() => {
            fs.unlinkSync( path.join('test', 'proj.aep') );
            fs.unlinkSync( path.join('test', 'image.jpg') );
        });

        it('should download each asset', () => {
            path.join('test', 'proj.aep').should.be.a.path();
            path.join('test', 'image.jpg').should.be.a.path();
        });

        it('should set project.template to asset.name if its project', () => {
            project.template.should.be.eql('proj.aep');
        });
    });

});
