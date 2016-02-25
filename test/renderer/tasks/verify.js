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
var verify = require('../../../renderer/tasks/verify.js');

describe('Task: filter', () => {

    let project = { workpath: 'test', resultname: 'result' };;

    afterEach(() => {
        fs.removeSync( path.join('test', 'result') );
    })

    it('should pass validation if file exists and size > 0', (done) => {
        fs.writeFileSync( path.join('test', 'result'), 'some test info');
        verify(project).should.be.fulfilled.notify(done);
    });

    it('should not pass validation if file doesnt exist', (done) => {
        verify(project).should.be.rejected.notify(done);
    });

    it('should not pass validation if file exist but its empty', (done) => {
        fs.writeFileSync( path.join('test', 'result'), '');
        verify(project).should.be.rejected.notify(done);
    });
});
