'use strict';

const express       = require('express');
const projects      = require('./controllers/project');
const rendernode    = require('./controllers/rendernode');
const middleware    = require('./middleware');
const promisade     = require('./promisade');

let router = express.Router();

// middleware
router.use(middleware);

// projects
router.get('/projects', (req, res) => {
    promisade( projects.get(), res );
});

router.post('/projects', (req, res) => {  
    promisade( projects.create( req.body ), res );
});

router.get('/projects/:id', (req, res) => {
    promisade( projects.get( req.params.id ), res );
});

router.put('/projects/:id', (req, res) => {
    promisade( projects.update( req.params.id, req.body ), res );
});

router.delete('/projects/:id', (req, res) => {
    promisade( projects.delete( req.params.id ), res );  
});

// rendernodes
router.post('/rendernodes', (req, res) => {
    rendernode.update(req); res.send(200);
});

module.exports = router;