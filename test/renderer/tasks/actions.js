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

process.env.RESULTS_DIR = 'test';

// require module
var actions = rewire('../../../renderer/tasks/actions.js');

describe('Task: actions', () => {

    let project;

    before(() => {
        actions.__set__('actions', {
            'copy-to-results':      { plugin: (a,b,c) => {c()} },
            'youtube-upload':       { plugin: (a,b,c) => {c()} },
            'email-notification':   { plugin: (a,b,c) => {c()} },
            'error-test':           { plugin: (a,b,c) => {c(new Error('some-error'))} }
        });
    });

    beforeEach(() => {
        project = { actions: [] };
    })

    it('should not raise errors if no actions provided', (done) => {
        actions(project).should.be.fulfilled.notify(done);
    });

    it('should ignore action that is not registered', (done) => {
        project.actions.push({ name: 'does-not-exist' });
        actions(project).should.be.fulfilled.notify(done);
    });

    it('should apply all actions that are provided', (done) => {
        project.actions.push({ name: 'youtube-upload' }, { name: 'email-notification' });
        actions(project).should.be.fulfilled.notify(done);
    });

    it('should pass error from action', (done) => {
        project.actions.push({ name: 'error-test' });
        actions(project).should.be.rejected.notify(done);
    });
});
