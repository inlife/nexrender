'use strict';

const chai      = require('chai')
const chaiAsFs  = require('chai-fs')
const fs        = require('fs-extra')
const path      = require('path')

chai.use(chaiAsFs);

global.should = chai.should();

// override paths for test folder
process.env.TEMP_DIRECTORY      = path.join(__dirname, 'temp');
process.env.TEMPLATES_DIRECTORY = path.join(__dirname, '..', 'res');

// require module
var setup = require('../../src/tasks/setup.js');

describe('Task: setup', () => {

    let project = {
        uid: 'mytestid',
        template: 'project.aepx',
        assets: []
    };

    const settings = {
        workpath: path.join(__dirname, 'temp'),
        logger: () => {},
    }

    let cperror = undefined;

    beforeEach((done) => {
        setup(project, settings).then((proj) => {
            project = proj; done();
        }).catch((err)=> {
            cperror = err; done();
        });
    });

    afterEach(() => {
        fs.removeSync( path.join(__dirname, 'temp',' mytestid') );
        fs.removeSync( path.join(__dirname, 'temp') );
    });

    it('should set project\'s workpath', () => {
        project.should.have.property('workpath').and.equal(
            path.join(__dirname, 'temp', 'mytestid')
        );
    });

    it('should have created temp folder if it not existed', () => {
        path.join(__dirname, 'temp', 'mytestid').should.be.a.path();
    });

    describe('(without project-as-asset)', () => {
        it('should have copied project file from templates to workpath dir', () => {
            path.join(__dirname, 'temp', 'mytestid', 'project.aepx').should.be.a.path();
        });
    });

    describe('(with project-as-asset)', () => {
        before(() => {
            project.assets.push({
                name: 'project.aepx',
                type: 'project'
            });
        })

        it('should not copy project if project asset is provided', () => {
            path.join(__dirname, 'temp', 'mytestid', 'project.aep').should.not.be.a.path();
        });
    });

    describe('(without project-as-asset and template field)', () => {
        before(() => {
            delete project.template;
        });

        it('should raise copy error', () => {
            cperror.should.not.be.undefined;
        });
    });
});
