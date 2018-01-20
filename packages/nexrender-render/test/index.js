'use strict';

const path      = require('path');
const chai      = require('chai');
const chaiAsFs  = require('chai-fs');
const chaiProm  = require('chai-as-promised');

chai.use(chaiAsFs);
chai.use(chaiProm);

global.should = chai.should();

describe('Testing @nexrender/render', () => {
    describe('Testing tasks', () => {
        require('./tasks/setup');
        require('./tasks/download');
        require('./tasks/rename');
        // require('./tasks/filter');
        // require('./tasks/patch');
        // require('./tasks/render');
        // require('./tasks/verify');
        // require('./tasks/actions');
        // require('./tasks/cleanup');
    });
});
