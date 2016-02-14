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

// projects
router.get('/projects', (req, res) => {
    controller
        .get()
        .then( res.json );   
});

router.post('/projects', (req, res) => {
    controller
        .create( req.body )
        .then( res.json );   
});

router.get('/projects/:id', (req, res) => {
    controller
        .get( req.params.id )
        .then( res.json );   
});

router.put('/projects/:id', (req, res) => {
    controller
        .update( req.params.id, req.body )
        .then( res.json );   
});

router.delete('/projects/:id', (req, res) => {
    controller
        .delete( req.params.id )
        .then( res.json );   
});

module.exports = router;