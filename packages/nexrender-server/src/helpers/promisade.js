'use strict';

// mixin for DRY
module.exports = (promise, res) => {
    promise
        .then(data => res.json(data))
        .catch((err) => {
            res.status(400);
            res.json(err);
        });
};