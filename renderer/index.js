'use strict';

const api           = require('../api');

const setup         = require('./tasks/setup');
const download      = require('./tasks/download');
const rename        = require('./tasks/rename');
const filter        = require('./tasks/filter');
const patch         = require('./tasks/patch');
const render        = require('./tasks/render');
const verify        = require('./tasks/verify');
const plugins       = require('./tasks/plugins');
const cleanup       = require('./tasks/cleanup');

const API_REQUEST_INTERVAL = 15 * 60 * 1000 || process.env.API_REQUEST_INTERVAL; // 15 minutes

/**
 * Apply tasks one by one
 * Each task is applied only once, after previous is finished
 * @param  {Project} project 
 * @param  {Function} resolve
 * @param  {Function} reject 
 */
function applyTasks(project, resolve, reject) {
    project
        .prepare()
        .then(setup)
        .then(download)
        .then(rename)
        .then(filter)
        .then(patch)
        .then(render)
        .then(verify)
        .then(plugins)
        .then(cleanup)
        .then((project) => {

            console.log('----------------------------');
            console.log(`[${project.uid}] project finished`);
            console.log('----------------------------\n');

            // project is finished
            project.finish().then(() => {
                resolve(project);
            });
        })
        .catch((err) => {

            console.log('--------------------------');
            console.log(`[${project.uid}] project failed`);
            console.log('--------------------------\n');

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

        console.log('making request for projects...');

        // request list
        api.get().then((results) => {

            console.log('looking for suitable projects...');

            // if list empty - reject
            if (!results || results.length < 1) {
                return reject();
            }

            // iterate, find queued
            for (let project of results) {
                if (project.state == 'queued') {
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
 * Reuqests next project
 * if project is found - starts rendering
 * after that restarts process again
 * but if project is not found - sets timeout
 * to request again after API_REQUEST_INTERVAL
 */
function startRecursion() {
    requestNextProject().then((project) => {
        startRender(project).then(startRecursion).catch(startRecursion)
    }).catch(() => {
        console.log('request failed or no suitable projects found. retrying in:', API_REQUEST_INTERVAL, 'sec');
        setTimeout(() => { startRecursion() }, API_REQUEST_INTERVAL);
    });
}

/**
 * Start automated reqeusting projects and rendering them
 * @param  {Object} opts Options object
 */
function start(opts) {
    console.log('=========[RENDERNODE]=========')
    console.log('nexrender.renderer is starting');
    console.log('==============================')

    opts = opts || {};

    // configure api connection
    api.config({
        host: opts.host || null,
        port: opts.port || null
    });

    // set global aerender path
    process.env.AE_BINARY = opts.aerender;

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
    render: startRender
};
