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
var filter = require("../../../renderer/tasks/filter.js");

describe('Task: filter', () => {

    let project;

});
