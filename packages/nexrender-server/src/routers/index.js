'use strict';

const express       = require('express');
const middleware    = require('../middleware');

const project       = require('./project');
const rendernode    = require('./rendernode');


module.exports = (options) => {
    let router = express.Router();

    // middleware
    router.use(middleware(options));
    router.get('/', (req, res) => res.send('<h1>nexrender-server</h1>\nUse /api/projects to list projects.'))

    // set up routes
    project.use(router);
    rendernode.use(router);

    return router;
};
