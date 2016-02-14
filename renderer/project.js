'use strict';

const shortid = require('shortid');
const api     = require('../api');

const DEFAULT_STATE         = 'queued';
const DEFAULT_TEMPLATE      = 'template1.aep';
const DEFAULT_COMPOSITION   = 'comp1';

const AE_CODEC = process.env.AE_CODEC || 'h264';

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
        this.settings       = data.settings     || { codec: AE_CODEC };
    }

    /**
     * Neat chaining
     * @return {Promise}
     */
    prepare() {
        return new Promise((resolve, reject) => {
            this.state = "rendering";
            this.update().then(() => {
                resolve(this);
            })
        });
    }

    update() {
        return api.update(this);
    }
}

module.exports = Project;