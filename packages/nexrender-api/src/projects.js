'use strict';

const assert    = require('assert')
const Project   = require('@nexrender/project')

const fetch     = global.__fetch_mock ? global.__fetch_mock : require('node-fetch')

/* simple uri formatter (shortcut) */
const uri = (apiurl, secret, id) => {
    return `${apiurl}/projects` + (id ? `/${id}` : '') + (secret ? `?secret=${secret}` : '')
}

module.exports = (apiurl, secret, instance) => ({
    /**
     * Creates new Project object, saves to server's database
     * @param  {Object} data  Plain object for project
     * @return {Promise}
     */
    create: (data) => {
        // setup default params
        data = data || {};

        // check for emptiness plain values
        try {
            assert(data.template);
            assert(data.composition);
        } catch (err) {
            return Promise.reject('[error] you need to provide project properties')
        }

        // and arrays
        data.assets   = data.assets   || [];
        data.settings = data.settings || {};
        data.actions  = data.actions  || [];

        return fetch(uri(apiurl, secret), {
                method:  'POST',
                body:    JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' },
            })
            .then(res => res.json())
            .then(json => new Project(json, instance))
    },

    /**
     * Get single or multiple entities of Project
     * @optional @param {Number} id
     * @return {Promise}
     */
    get: (id) => {
        id = id || null;

        // return single
        if (id !== null) {
            return fetch(uri(apiurl, secret, id))
                .then(res => res.ok ? res : Promise.reject('cannot find project with id: ' + id) )
                .then(res => res.json())
                .then(json => new Project(json, instance))
        }
        // return multiple
        else {
            return fetch(uri(apiurl, secret))
                .then(res => res.ok ? res : Promise.reject('error listing all projects') )
                .then(res => res.json())
                .then(projects => projects
                    .map(json => new Project(json, instance)))
        }
    },

    /**
     * Update object on server
     * @param  {Object || Project} object
     * @return {Promise}
     */
    update: (object) => {
        let uobj = object;

        if (object instanceof Project) {
            uobj = object.serialize();
        }

        return fetch(uri(apiurl, secret, uobj.id), {
                method:  'PUT',
                body:    JSON.stringify(uobj),
                headers: { 'Content-Type': 'application/json' },
            })
            .then(res => res.ok ? res : Promise.reject('cannot update project with id: ' + id))
            .then(res => res.json())
            .then(data => {
                if (object instanceof Project) {
                    return object.deserialize(data);
                } else {
                    return new Project(data, instance);
                }
            })
    },

    /**
     * Remove object from server
     * @param  {Number} id project uid
     * @return {Promise}
     */
    remove: (id) => {
        return fetch(uri(apiurl, secret, id), { method: 'DELETE' })
            .then(res => res.ok ? res : Promise.reject('cannot remove project with id: ' + id))
            .then(res => res.json())
    },
})
