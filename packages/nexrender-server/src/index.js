'use strict';

const express       = require('express');
const bodyParser    = require('body-parser');
const morgan        = require('morgan');
const router        = require('./routers/');

let app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('tiny'));

app.use('/api', router);

module.exports = {
    start: function(port, dbPath = './db.json') {
        app.listen(port, function () {
            console.log('nexrender-server is listening on port:', port);
        });
    }
};
