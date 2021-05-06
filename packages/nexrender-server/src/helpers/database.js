const databaseType = process.env.NEXRENDER_DATABASE_TYPE || 'disk';

if (databaseType === 'redis') {
    module.exports = require('../stores/redis.js');
} else {
    module.exports = require('../stores/disk.js');
}
