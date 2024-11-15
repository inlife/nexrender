const databaseType = process.env.NEXRENDER_DATABASE_PROVIDER;

/* place to register all plugins */
/* so they will be picked up and resolved by pkg */
if (process.env.NEXRENDER_REQUIRE_PLUGINS) {
    require('@create-global/nexrender-database-redis');
}

if (databaseType === 'redis') {
    module.exports = require('@create-global/nexrender-database-redis');
} else {
    module.exports = require('./disk.js');
}
