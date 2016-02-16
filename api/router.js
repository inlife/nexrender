'use strict';

let bind = (client, host, port) => {
    let url = ['http://', host, ':', port, '/api/'].join('');

    client.registerMethod("create", url + 'projects',       "POST");
    // client.registerMethod("getAll", url + 'projects',       "GET");
    client.registerMethod("get",    url + 'projects/${id}', "GET");
    client.registerMethod("update", url + 'projects/${id}', "PUT");
    client.registerMethod("delete", url + 'projects/${id}', "DELETE");

    return true;
};

module.exports = {
    bind: bind
};