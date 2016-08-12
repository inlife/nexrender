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

    // TODO: write test for actions
});
