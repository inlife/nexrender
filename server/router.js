'use strict';

const express       = require('express');
const controller    = require('./controller');

let router = express.Router();

// middleware
router.use((req, res, next) => {
    console.log('Something is happening.');
    next();
});

// routes

// mixin for DRY
var promisade = function(promise, res) {
    promise
        .then(data => res.json(data))
        .catch((err) => {
            res.status(400);
            res.json(err);
        });
};

// projects
router.get('/projects', (req, res) => {
    promisade( controller.get(), res );
});

router.post('/projects', (req, res) => {  
    promisade( controller.create( req.body ), res );
});

router.get('/projects/:id', (req, res) => {
    promisade( controller.get( req.params.id ), res );
});

router.put('/projects/:id', (req, res) => {
    promisade( controller.update( req.params.id, req.body ), res );
});

router.delete('/projects/:id', (req, res) => {
    promisade( controller.delete( req.params.id ), res );  
});

module.exports = router;