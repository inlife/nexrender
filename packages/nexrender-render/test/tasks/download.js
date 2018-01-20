'use strict';

const fs        = require('fs')
const path      = require('path')
const chai      = require('chai')
const chaiAsFs  = require('chai-fs')
const express   = require('express')
const exec      = require('child_process').exec

chai.use(chaiAsFs);

global.should = chai.should();

// require module
var download = require('../../src/tasks/download.js');

describe('Task: download', () => {
    const settings = {
        logger: () => {},
    }

    describe('remote file', () => {
        let app = express();
        let server = null;
        let cperror = undefined;
        let project = {
            uid: 'mytestid',
            template: 'project.aepx',
            workpath: __dirname,
            assets: [{
                type: 'project',
                src: 'http://localhost:3322/proj.aepx',
                name: 'proj.aepx'
            }, {
                type: 'image',
                src: 'http://localhost:3322/image.jpg'
            }]
        };


        before((done) => {
            fs.mkdirSync( path.join(__dirname, 'public') );
            fs.writeFileSync( path.join(__dirname, 'public', 'proj.aepx'), 'dummy');
            fs.writeFileSync( path.join(__dirname, 'public', 'image.jpg'), 'dummy');

            app.use( express.static( path.join(__dirname, 'public') ));
            server = app.listen(3322, done);
        });

        after(() => {
            exec('rm -r ' + path.join(__dirname, 'public'));
            server.close();
        });

        beforeEach((done) => {
            download(project, settings).then((proj) => {
                project = proj; done();
            }).catch((err) => {
                cperror = err;
                setTimeout(done, 100);
            });
        });

        afterEach(() => {
            fs.unlinkSync( path.join(__dirname, 'proj.aepx') );
            fs.unlinkSync( path.join(__dirname, 'image.jpg') );
        });

        it('should download each asset', () => {
            path.join(__dirname, 'proj.aepx').should.be.a.path();
            path.join(__dirname, 'image.jpg').should.be.a.path();
        });

        it('should set project.template to asset.name if its project', () => {
            project.template.should.be.eql('proj.aepx');
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
        const assetsDir = path.join(__dirname, 'assets')

        let project = {
            uid: 'mytestid',
            template: 'project.aepx',
            workpath: __dirname,
            assets: [{
                type: 'project',
                src: path.join(assetsDir, 'proj.aepx'),
                name: 'proj.aepx'
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
            exec('rm -r ' + assetsDir);
        });

        beforeEach((done) => {
            download(project, settings).then((proj) => {
                project = proj; done();
            }).catch(console.log);
        });

        afterEach(() => {
            fs.unlinkSync( path.join(__dirname, 'proj.aepx') );
            fs.unlinkSync( path.join(__dirname, 'image.jpg') );
        });

        it('should download each asset', () => {
            path.join(__dirname, 'proj.aepx').should.be.a.path();
            path.join(__dirname, 'image.jpg').should.be.a.path();
        });

        it('should set project.template to asset.name if its project', () => {
            project.template.should.be.eql('proj.aepx');
        });
    });

});
