'use strict';

const shortid = require('shortid');
const api     = require('../api');

const DEFAULT_STATE         = 'queued';
const DEFAULT_TEMPLATE      = 'template1.aep';
const DEFAULT_COMPOSITION   = 'comp1';

class Project {

    /**
     * Creates project entity from params
     * @param  {Object}
     * @return {Project}
     */
    constructor(params) {
        let data            = params            || {};

        this.uid            = data.uid          || shortid();
        this.state          = data.state        || DEFAULT_STATE;
        this.template       = data.template     || DEFAULT_TEMPLATE;
        this.composition    = data.composition  || DEFAULT_COMPOSITION;
        this.assets         = data.assets       || [];
        this.postActions    = data.postActions  || [];
    }

    /**
     * Neat chaining
     * @return {Promise}
     */
    prepare() {
        return new Promise((resolve, reject) => {
            resolve(this);
        });
    }

    update() {
        return api.update(this);
    }
}

module.exports = Project;