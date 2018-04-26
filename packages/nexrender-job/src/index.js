'use strict'

const shortid = require('shortid')

const DEFAULT_STATE         = 'queued';
const DEFAULT_TEMPLATE      = 'template.aepx';
const DEFAULT_COMPOSITION   = 'comp1';
const DEFAULT_PROJECT_TYPE  = 'default';

// TODO: refactor
const TICKER_INTERVAL = 60 * 1000 || process.env.API_UPDATE_INTERVAL; // 1 minute

class Job {

    /**
     * Creates job entity from params
     * @param  {Object}
     * @param  {Object} api Inject connected api
     * @return {Job}
     */
    constructor(params, api) {
        this.deserialize( params );

        this.callbacks  = {};
        this.ticker     = null;
        this.api        = api || null;
        this.error      = null;
    }

    /**
     * Serialize job properties to plain object
     * @return {Object}
     */
    serialize() {
        return {
            uid:            this.uid,
            type:           this.type,
            state:          this.state,
            files:          this.files,
            template:       this.template,
            settings:       this.settings,
            composition:    this.composition,
            actions:        this.actions,
            errors:         this.errors
        };
    }

    /**
     * Desirialize data from plain object to Job object
     * @param  {Object} params
     */
    deserialize(params) {
        let data            = params            || {};

        this.uid            = data.uid          || shortid();
        this.state          = data.state        || DEFAULT_STATE;
        this.template       = data.template     || DEFAULT_TEMPLATE;
        this.composition    = data.composition  || DEFAULT_COMPOSITION;
        this.type           = data.type         || DEFAULT_PROJECT_TYPE;
        this.files          = data.files        || [];
        this.actions        = data.actions      || [];
        this.settings       = data.settings     || {};
        this.errors         = data.errors       || [];

        return this;
    }

    /**
     * Sets job state
     * @private
     * @param {String} state
     */
    setStateAndSave(state) {
        return new Promise((resolve, reject) => {
            // chage state
            this.state = state;

            // call inner method (for job entity created on renderer side)
            this.callMethod( state );

            // save entity and resolve promise
            this.save().then(() => {
                resolve(this);
            });
        });
    }

    /**
     * Sets state of job to 'rendering' (render started)
     * @return {Promise}
     */
    prepare() {
        return this.setStateAndSave('rendering');
    }

    /**
     * Sets state of job to 'finished' (render succeeded)
     * @return {Promise}
     */
    finish() {
        return this.setStateAndSave('finished');
    }

    /**
     * Sets state of job to 'error' (render failed)
     * @param {Mixed} err
     * @return {Promise}
     */
    failure(err) {
        this.errors.push((err.message) ? err.message : err);
        return this.setStateAndSave('failed');
    }

    /**
     * Function get called every TICKER_INTERVAL
     * to check job state on server
     */
    onTick() {
        if (this.api === null) return;

        this.api.jobs.get(this.uid).then((job) => {
            if (this.state !== job.state) {
                this.deserialize( job );
                this.callMethod( job.state );
            }
        })
    }

    /**
     * Binding for api update method
     * @return {Promise}
     */
    save() {
        return (this.api !== null) ? this.api.jobs.update(this) : new Promise(r => r());
    }

    /**
     * Binding for api remove method
     * @return {Promise}
     */
    remove() {
        return (this.api !== null) ? this.api.jobs.remove(this) : new Promise(r => r());
    }

    /**
     * Binder for events
     * @param  {String}   method   Event name
     * @param  {Function} callback Event handelr
     * @return {[type]}            [description]
     * TODO: get rid of setInterval memory leaking
     */
    on(method, callback) {
        if (!this.ticker && this.api !== null) {
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
                callback(this.errors.length > 0 ? this.errors.pop() : null, this);
            }
        }
    }
}

module.exports = Job;
