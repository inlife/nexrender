'use strict';

const express       = require('express');
const bodyParser    = require('body-parser');
const morgan        = require('morgan');
const low           = require('lowdb');
const lowfile       = require('lowdb/adapters/FileSync')

const project       = require('./controllers/project')
const router        = require('./routers/');

let app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('tiny'));

app.use('/api', router);
app.get('/', (req, res) => res.send('<h1>nexrender-server</h1>\nUse /api/projects to list projects.'))

const setupdb = (dbpath) => {
    // load file sync database
    const adapter   = new lowfile(dbpath)
    const database  = low(adapter);

    database.defaults({ projects: [] }).write();
    return database;
}

module.exports = {
    start: function(port, dbpath = './db.json') {
        const database = setupdb(dbpath);

        project.use(database)

        app.listen(port, function () {
            console.log('nexrender-server is listening on port:', port);
        });
    }
};

module.exports.start(3000)
