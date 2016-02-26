'use strict';

const chai      = require('chai');
const chaiAsFs  = require('chai-fs');
const chaiProm  = require('chai-as-promised');
const fs        = require('fs-extra');
const path      = require('path');
const rewire    = require('rewire');

chai.use(chaiAsFs);
chai.use(chaiProm);

global.should = chai.should();

// require module
var render = rewire('../../../renderer/tasks/render.js');

describe('Task: render', () => {

    let project;
    let spawned;
    let code = 0;
    let cbs = {
        out: null,
        err: null,
        cls: null
    };

    before(() => {
        render.__set__('spawn', (name, args) => {
            spawned = {
                name: name,
                args: args,
                stdout: { on: (a, b) => {cbs.out = b} },
                stderr: { on: (a, b) => {cbs.err = b} },
                on: (a, b) => {cbs.cls = b}
            };

            setTimeout(() => {
                cbs.cls(code);
            }, 100);

            return spawned;
        });
    });

    beforeEach(() => {
        project = { 
            workpath: 'test', 
            template: 'work'
        };
    });

    it('should fallback to default out extension', (done) => {
        code = 0;

        render(project).should.be.fulfilled.then((project) => {
            project.should.have.property('resultname').and.be.eql('result.mp4') 
        }).should.notify(done);
    })
});
