'use strict';

const promisade     = require('../helpers/promisade');
const projects      = require('../controllers/project');

module.exports = {
    use: function(router) {

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
    }
};
