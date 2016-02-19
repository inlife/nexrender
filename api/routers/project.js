'use strict';

const request = require('request');

let API_URL = 'http://localhost:3000/api/';

module.exports = {

    /**
     * Binder for remembering api server host and port
     * @param  {String} host remote api server host
     * @param  {Number} port remote api server port
     * @return {Bool}
     */
    bind: function (host, port) {
        API_URL = ['http://', host, ':', port, '/api/projects/'].join('');
        return true;
    },

    /**
     * Wrapper for create
     * @param  {Object}   data   serialized project
     * @param  {Function} callback
     */
    create: function(data, callback) {
        request({
            url: API_URL,
            method: 'POST',
            json: data
        }, callback);
    },

    /**
     * Wrapper for get (single)
     * @param  {Number}   id     project uid
     * @param  {Function} callback
     */
    get: function(id, callback) {
        request({
            url: API_URL + id + '/',
            method: 'GET'
        }, callback);
    },

    /**
     * Wrapper for get (multiple)
     * @param  {Function} callback
     */
    getAll: function(callback) {
        request({
            url: API_URL,
            method: 'GET'
        }, callback);
    },

    /**
     * Wrapper for update
     * @param  {Number}   id     project uid
     * @param  {Object}   data   serialized project
     * @param  {Function} callback
     */
    update: function(id, data, callback) {
        request({
            url: API_URL + id + '/',
            method: 'PUT',
            json: data
        }, callback);
    },

    /**
     * Wrapper for remove
     * @param  {Number}   id     project uid
     * @param  {Function} callback
     */
    remove: function(id, callback) {
        request({
            url: API_URL + id + '/',
            method: 'DELETE'
        }, callback);
    }
};
