'use strict';

const rendernode    = require('../controllers/rendernode');

module.exports = { 
    use: function(router) {
        // rendernodes
        router.post('/rendernodes', (req, res) => {
            rendernode.update(req); res.send(200);
        });
    }
};
