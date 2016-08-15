'use strict';

// can be overrided in test
let api             = require('../api');

const setup         = require('./tasks/setup');
const download      = require('./tasks/download');
const rename        = require('./tasks/rename');
const filter        = require('./tasks/filter');
const patch         = require('./tasks/patch');
const render        = require('./tasks/render');
const verify        = require('./tasks/verify');
const actions       = require('./tasks/actions');
const cleanup       = require('./tasks/cleanup');

const Project       = require('../api/models/project');

const API_REQUEST_INTERVAL = process.env.API_REQUEST_INTERVAL || 15 * 60 * 1000; // 15 minutes

/**
 * Apply tasks one by one
 * Each task is applied only once, after previous is finished
 * @param  {Project} project 
 * @param  {Function} resolve
 * @param  {Function} reject 
 */
function applyTasks(project, resolve, reject) {

    // TODO: make this ugly motherfucker
    // down below look nicer :D
    project
        .prepare()
        .then(setup)
        .then(download)
        .then(rename)
        .then(filter)
        .then(patch)
        .then(render)
        .then(verify)
        .then(actions)
        .then(cleanup)
        .then((project) => {

            console.info('----------------------------');
            console.info(`[${project.uid}] project finished`);
            console.info('----------------------------\n');

            // project is finished
            project.finish().then(() => {
                resolve(project);
            });
        })
        .catch((err) => {

            console.info('--------------------------');
            console.info(`[${project.uid}] project failed`);
            console.info('--------------------------\n');

            console.info('Error message:', err.message || err);

            // project encountered an error
            project.failure(err).then(() => {
                reject(project);
            })
        });
};

/**
 * Reqeusts list of all projects
 * itearate over each and returst first one that's state is 'queued'
 * @return {Promise}
 */
function requestNextProject() {
    return new Promise((resolve, reject) => {

        console.info('making request for projects...');

        // request list
        api.get().then((results) => {

            console.info('looking for suitable projects...');

            // if list empty - reject
            if (!results || results.length < 1) {
                return reject();
            }

            // iterate, find queued
            for (let project of results) {
                if (project.state === 'queued') {
                    return resolve( project );
                }
            }

            // if not found - reject
            return reject();

        // if error - reject
        }).catch(reject);
    });
}

/**
 * Requests next project
 * if project is found - starts rendering
 * after that restarts process again
 * but if project is not found - sets timeout
 * to request again after API_REQUEST_INTERVAL
 */
function startRecursion() {
    requestNextProject().then((project) => {
        startRender(project).then(startRecursion).catch(startRecursion)
    }).catch(() => {
        console.info('request failed or no suitable projects found. retrying in:', API_REQUEST_INTERVAL, 'msec');
        setTimeout(() => { startRecursion() }, API_REQUEST_INTERVAL);
    });
}

/**
 * Start automated reqeusting projects and rendering them
 * @param  {Object} opts Options object
 */
function start(opts) {
    console.info('=========[RENDERNODE]=========\n')
    console.info('nexrender.renderer is starting\n');
    console.info('------------------------------');

    opts = opts || {};

    // configure api connection
    api.config({
        host: opts.host || null,
        port: opts.port || null
    });

    // set global aerender path
    process.env.AE_BINARY       = opts.aerender     || '';
    process.env.AE_MULTIFRAMES  = opts.multiframes  || '';
    process.env.AE_MEMORY       = opts.memory       || '';

    // start quering
    startRecursion();
}

/**
 * Start project rendering and return promise
 * @param  {Project} project
 * @return {Promise}
 */
function startRender(project) {
    return new Promise((res, rej) => {
        return applyTasks(project, res, rej);
    });
}

module.exports = {
    start: start,

    /**
     * Local project model renderer method wrapper
     * 
     * @param  {string} binary  path to Adobe After Effects aerender binary
     * @param  {Array} opts    optional options array
     * @param  {Project} project project model
     * @return {Promise} rendering promise
     */
    render: (binary, opts, project) => {
        // parameters validation
        if (typeof binary !== 'string') {
            throw new Error('nexrender.renderer.render: first argument must be a string, pointing to "aerender" binary');
        }

        if (!project && opts instanceof Project) {
            project = opts;
            opts    = {};
        }

        if (!project && !opts instanceof Project) {
            throw new Error('nexrender.renderer.render: second optional argument is options, third required is a Project ');
        }

        // set up default global constatns
        process.env.AE_BINARY       = binary            || '';
        process.env.AE_MULTIFRAMES  = opts.multiframes  || '';
        process.env.AE_MEMORY       = opts.memory       || '';

        // return promise and start rendering
        return startRender(project);
    }
};
