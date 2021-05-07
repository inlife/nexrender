
const requireg = require('requireg');

const databaseType = process.env.NEXRENDER_DATABASE_PROVIDER;

if (databaseType !== undefined) {
    module.exports = requireg(`@nexrender/database-${databaseType}`);
} else {
    module.exports = require('./disk.js');
}
