'use strict';

var shortid = require('shortid');
var api     = require('../../api');

const DEFAULT_STATE         = 'queued';
const DEFAULT_TEMPLATE      = 'template1';
const DEFAULT_COMPOSITION   = 'comp1';

class Project {

    constructor(params) {
        let data            = params            || {};

        this.uid            = data.uid          || shortid();
        this.state          = data.state        || DEFAULT_STATE;
        this.template       = data.template     || DEFAULT_TEMPLATE;
        this.composition    = data.composition  || DEFAULT_COMPOSITION;
        this.assets         = data.assets       || [];
        this.postActions    = data.postActions  || [];
    }

    update() {
        api.updateProject(this);
    }
}

module.exports = Project;