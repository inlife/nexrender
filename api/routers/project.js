'use strict';

const request = require('request');

let API_URL = 'http://localhost:3000/api/';

module.exports = {

    bind: function (host, port) {
        API_URL = ['http://', host, ':', port, '/api/projects/'].join('');
        return true;
    },

    create: function(data, callback) {
        request({
            url: API_URL,
            method: 'POST',
            json: data
        }, callback);
    },

    get: function(id, callback) {
        request({
            url: API_URL + id + '/',
            method: 'GET'
        }, callback);
    },

    getAll: function(callback) {
        request({
            url: API_URL,
            method: 'GET'
        }, callback);
    },

    update: function(id, data, callback) {
        request({
            url: API_URL + id + '/',
            method: 'PUT',
            json: data
        }, callback);
    },

    remove: function(id, callback) {
        request({
            url: API_URL + id + '/',
            method: 'DELETE'
        }, callback);
    }
};
