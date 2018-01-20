const express       = require('express');
const bodyParser    = require('body-parser');
const morgan        = require('morgan');
const low           = require('lowdb');
const lowfile       = require('lowdb/adapters/FileSync')

const project       = require('./controllers/project')
const router        = require('./routers/');

const setupdb = (dbpath) => {
    // load file sync database
    const adapter   = new lowfile(dbpath)
    const database  = low(adapter);

    database.defaults({ projects: [] }).write();
    return database;
}

const setupweb = (options) => {
    const app = express();

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(morgan('tiny'));
    app.use('/api', router(options))

    return app
}

module.exports = {
    start: function(options = {}) {
        options.dbpath  = options.dbpath    || './db.json';
        options.host    = options.host      || '0.0.0.0';
        options.port    = options.port      || 3000;
        options.secret  = options.secret    || '';

        // create local db and webapp
        const database = setupdb(options.dbpath);
        const webapp   = setupweb(options);

        // inject db into submodules
        project.use(database)

        return new Promise((resolve) => {
            webapp.listen(options.port, options.host, () => resolve(webapp, database));
        })
    }
};
