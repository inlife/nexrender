'use strict';

module.exports = options => (req, res, next) => {
    if (options.secret != '') {
        if (!req.query.secret || req.query.secret != options.secret) {
            res.status(403)
        }
    }

    next();
}
