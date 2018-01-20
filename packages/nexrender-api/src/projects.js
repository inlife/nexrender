const assert    = require('assert')
const Project   = require('@nexrender/project')

const fetch     = global.__fetch_mock ? global.__fetch_mock : require('node-fetch');

module.exports = (apiurl, instance) => ({
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
            assert( data.template );
            assert( data.composition );
        } catch (err) {
            return Promise.reject('[error] you need to provide project properties')
        }

        // and arrays
        data.assets      = data.assets      || [];
        data.settings    = data.settings    || {};
        data.actions     = data.actions     || [];

        return fetch(`${apiurl}/projects`, {
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
    get: (id = null) => {
        // return single
        if (id !== null) {
            return fetch(`${apiurl}/projects/${id}`)
                .then(res => res.ok ? res : Promise.reject('cannot find project with id: ' + id) )
                .then(res => res.json())
                .then(json => new Project(json, instance))
        }
        // return multiple
        else {
            return fetch(`${apiurl}/projects`)
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

        return fetch(`${apiurl}/projects/${uobj.id}`, {
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
        return fetch(`${apiurl}/projects/${id}`, { method: 'DELETE' })
            .then(res => res.ok ? res : Promise.reject('cannot remove project with id: ' + id))
            .then(res => res.json())
    }
})
