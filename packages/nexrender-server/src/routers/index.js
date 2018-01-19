'use strict';

const express       = require('express');
const middleware    = require('../middleware');

const project       = require('./project');
const rendernode    = require('./rendernode');

let router = express.Router();

// middleware
router.use(middleware);

// set up routes
project.use(router);
rendernode.use(router);

module.exports = router;
