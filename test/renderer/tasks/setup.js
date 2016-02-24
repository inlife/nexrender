'use strict';

var chai            = require('chai');
var chaiAsPromised  = require('chai-as-promised');
var chaiAsFs        = require('chai-fs');

chai.use(chaiAsPromised);
chai.use(chaiAsFs);

global.should = chai.should();

process.env.TEMP_DIRECTORY      = 'test/temp';
process.env.TEMPLATES_DIRECTORY = 'test/templates';

var setup = require("../../../renderer/tasks/setup.js");

var project = {
    uid: 'mytestid',
    template: 'project.aep',
    assets: []
};

describe('setup task', () => {
    
    it('should set project workpath', () => {
        setup(project).should.eventually.have.property('workpath').and.equal('test/temp/mytestid');
    });

    it('should have created temp folder if it not existed', () => {
        'test/temp/mytestid'.should.be.a.path();
    });

    it('should have copied project file from templates to workpath dir', () => {
        'test/temp/mytestid/project.aep'.should.be.a.path();
    });
});
