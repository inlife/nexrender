'use strict';

const assert    = require('assert')
const Job       = require('@nexrender/job')
const fetch     = global.__fetch_mock ? global.__fetch_mock : require('node-fetch')

/* simple uri formatter (shortcut) */
const uri = (apiurl, secret, id) => {
    return `${apiurl}/jobs` + (id ? `/${id}` : '') + (secret ? `?secret=${secret}` : '')
}

module.exports = (apiurl, secret, instance) => ({
    /**
     * Creates new Job object, saves to server's database
     * @param  {Object} data  Plain object for job
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
            return Promise.reject('[error] you need to provide job properties')
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
            .then(json => new Job(json, instance))
    },

    /**
     * Get single or multiple entities of Job
     * @optional @param {Number} id
     * @return {Promise}
     */
    get: (id) => {
        id = id || null;

        // return single
        if (id !== null) {
            return fetch(uri(apiurl, secret, id))
                .then(res => res.ok ? res : Promise.reject('cannot find job with id: ' + id) )
                .then(res => res.json())
                .then(json => new Job(json, instance))
        }
        // return multiple
        else {
            return fetch(uri(apiurl, secret))
                .then(res => res.ok ? res : Promise.reject('error listing all jobs') )
                .then(res => res.json())
                .then(jobs => jobs
                    .map(json => new Job(json, instance)))
        }
    },

    /**
     * Update object on server
     * @param  {Object || Job} object
     * @return {Promise}
     */
    update: (object) => {
        let uobj = object;

        if (object instanceof Job) {
            uobj = object.serialize();
        }

        return fetch(uri(apiurl, secret, uobj.id), {
                method:  'PUT',
                body:    JSON.stringify(uobj),
                headers: { 'Content-Type': 'application/json' },
            })
            .then(res => res.ok ? res : Promise.reject('cannot update job with id: ' + id))
            .then(res => res.json())
            .then(data => {
                if (object instanceof Job) {
                    return object.deserialize(data);
                } else {
                    return new Job(data, instance);
                }
            })
    },

    /**
     * Remove object from server
     * @param  {Number} id job uid
     * @return {Promise}
     */
    remove: (id) => {
        return fetch(uri(apiurl, secret, id), { method: 'DELETE' })
            .then(res => res.ok ? res : Promise.reject('cannot remove job with id: ' + id))
            .then(res => res.json())
    },
})
