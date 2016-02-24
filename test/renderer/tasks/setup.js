'use strict';

const chai      = require('chai');
const chaiAsFs  = require('chai-fs');
const fs        = require('fs-extra');
const path      = require('path');

chai.use(chaiAsFs);

global.should = chai.should();

// override paths for test folder
process.env.TEMP_DIRECTORY      = path.join('test', 'temp');
process.env.TEMPLATES_DIRECTORY = path.join('test', 'templates');

// require module
var setup = require("../../../renderer/tasks/setup.js");

describe('Task: setup', () => {

    let project = {
        uid: 'mytestid',
        template: 'project.aep',
        assets: []
    };

    let cperror = undefined;

    beforeEach((done) => {
        setup(project).then((proj) => {
            project = proj; done();
        }).catch((err)=> {
            cperror = err; done();
        });
    });

    afterEach(() => {
        fs.removeSync( path.join('test', 'temp',' mytestid') );
        fs.removeSync( path.join('test', 'temp') );
    });

    it('should set project\'s workpath', () => {
        project.should.have.property('workpath').and.equal('test/temp/mytestid');
    });

    it('should have created temp folder if it not existed', () => {
        'test/temp/mytestid'.should.be.a.path();
    });

    describe('(without project-as-asset)', () => {
        it('should have copied project file from templates to workpath dir', () => {
            'test/temp/mytestid/project.aep'.should.be.a.path();
        });
    });
    
    describe('(with project-as-asset)', () => {
        before(() => {
            project.assets.push({
                name: 'project.aep',
                type: 'project'
            });
        })

        it('should not copy project if project asset is provided', () => {
            'test/temp/mytestid/project.aep'.should.not.be.a.path();
        });
    });

    describe('(without project-as-asset and template field)', () => {
        before(() => {
            delete project.template;
        });

        it('should raise error', () => {
            cperror.should.not.be.undefined;
        });
    });
});
