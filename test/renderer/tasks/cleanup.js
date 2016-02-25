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
var cleanup = require('../../../renderer/tasks/cleanup.js');

describe('Task: filter', () => {

    let project = { workpath: path.join('test', 'work') };

    it('should delete all files inside workpath', (done) => {
        fs.mkdirSync( path.join('test', 'work') );
        fs.writeFile( path.join('test', 'work', 'file1') );
        fs.writeFile( path.join('test', 'work', 'file2') );

        cleanup(project).should.be.fulfilled.then(() => {
            path.join('test', 'work', 'file1').should.not.be.path;
            path.join('test', 'work', 'file2').should.not.be.path;
            path.join('test', 'work').should.not.be.path;
            path.join('test').should.be.path;
        }).should.notify(done);
    });

    it('should throw error if path does not exist', () => {
        cleanup(project).should.not.be.fulfilled;
    });
});
