'use strict';

const shortid = require('shortid');

const DEFAULT_STATE         = 'queued';
const DEFAULT_TEMPLATE      = 'template.aep';
const DEFAULT_COMPOSITION   = 'comp1';

const TICKER_INTERVAL       = 60 * 1000; // 1 minute

const AE_CODEC = process.env.AE_CODEC || 'h264';


class Project {

    /**
     * Creates project entity from params
     * @param  {Object}
     * @param  {Object} api Inject connected api
     * @return {Project}
     */
    constructor(params, api) {
        this.deserialize( params );

        this.callbacks  = {};
        this.ticker     = null;
        this.api        = api || null;
        this.error      = null;
    }

    /**
     * Serialize project properties to plain object
     * @return {Object} 
     */
    serialize() {
        return {
            uid:            this.uid,
            state:          this.state,
            asset:          this.assets,
            template:       this.template,
            settings:       this.settings,
            composition:    this.composition,
            postActions:    this.postActions,
            errorMessage:   this.errorMessage
        };
    }

    /**
     * Desirialize data from plain object to Project object
     * @param  {Object} params 
     */
    deserialize(params) {
        let data            = params            || {};

        this.uid            = data.uid          || shortid();
        this.state          = data.state        || DEFAULT_STATE;
        this.template       = data.template     || DEFAULT_TEMPLATE;
        this.composition    = data.composition  || DEFAULT_COMPOSITION;
        this.assets         = data.assets       || [];
        this.postActions    = data.postActions  || [];
        this.settings       = data.settings     || { codec: AE_CODEC };
        this.errorMessage   = data.errorMessage || null;
    }

    // RENDERER ONLY SIZE METHODS

    /**
     * Sets state of project to 'rendering' (render started)
     * @return {Promise}
     */
    prepare() {
        return new Promise((resolve, reject) => {
            this.state = "rendering";
            this.save().then(() => {
                resolve(this);
            })
        });
    }

    /**
     * Sets state of project to 'finished' (render succeeded)
     * @return {Promise}
     */
    finish() {
        return new Promise((resolve, reject) => {
            this.state = "finished";
            this.save().then(() => {
                resolve(this);
            })
        });
    }

    /**
     * Sets state of project to 'error' (render failed)
     * @param {Mixed} err
     * @return {Promise}
     */
    failure(err) {
        console.log('omg error', err);
        let errmsg = (err.message) ? err.message : err;

        return new Promise((resolve, reject) => {
            this.state = "failure";
            this.errorMessage = errmsg; 
            this.save().then(() => {
                resolve(this);
            })
        });
    }

    // END RENDERER ONLY SIDE METHODS

    /**
     * Function get called every TICKER_INTERVAL
     * to check project state on server
     */
    onTick() {
        this.api.get(this.uid).then((project) => {
            if (this.state !== project.state) {
                this.deserialize( project );
                this.callMethod( project.state );
            }
        })
    }

    /**
     * Binding for api update method
     * @return {Promise}
     */
    save() {
        return this.api.update(this);
    }

    /**
     * Binding for api remove method
     * @return {Promise}
     */
    remove() {
        return this.api.remove(this.uid);
    }

    /**
     * Binder for events
     * @param  {String}   method   Event name
     * @param  {Function} callback Event handelr
     * @return {[type]}            [description]
     */
    on(method, callback) {
        if (!this.ticker) {
            this.ticker = setInterval(() => { this.onTick(); }, TICKER_INTERVAL);
        }

        if (this.callbacks[method]) {
            return this.callbacks[ method ].push( callback );
        }

        return this.callbacks[ method ] = [ callback ]
    }

    /**
     * Event caller 
     * @param  {String} method Event name
     */
    callMethod(method) {
        if (this.callbacks[method]) {
            for (let callback of this.callbacks[method]) {
                callback( this.errorMsg, this);
            }
        }
    }
}

module.exports = Project;
