const shortid = require('shortid');

class Controller {
    /**
     * Called on loading, creates db connection
     * Binds methods
     */
    use(database) {
        this.db = database.get('projects');

        // bind useful findAll method
        this.db.findAll = function(query) {
            var query = query || {};

            if (query.uid) {
                return this.find( query ).value();
            }

            return this.chain().filter( query ).value().filter( n => n !== null );
        };
    }

    /**
     * Called on POST request
     * @param  {Object} data JSON project
     * @return {Promise}
     */
    create(data) {
        // set default data
        data.uid = data.uid || shortid();
        data.state = data.state || 'queued';
        data.createdAt = new Date;
        data.updatedAt = new Date;

        // save data
        this.db.push(data).write();

        // return promise and get last added project
        return new Promise((resolve, reject) => {
            resolve( this.db.last() );
        });
    }

    /**
     * Called on GET request
     * @optional @param {Number} id Project uid
     * @return {Promise}
     */
    get(id) {
        // get project by id, or get all items if id not provided
        return new Promise((resolve, reject) => {
            resolve( this.db.findAll( id ? { uid: id } : {} ) || reject( {} ).value() );
        });
    }

    /**
     * Called on PUT request
     * @param {Number} id Project uid
     * @param  {Object} data JSON project
     * @return {Promise}
     */
    update(id, data) {
        // set default data
        data.updatedAt = new Date;

        // update data and return
        return new Promise((resolve, reject) => {
            resolve( this.db.chain().find({ uid: id }).assign( data ).write() );
        });
    }

    /**
     * Called on DELETE request
     * @param  {Number} id Project uid
     * @return {Promise}
     */
    delete(id) {
        // remove project by id
        return new Promise((resolve, reject) => {
            resolve( this.db.remove({ uid : id }).write() );
        });
    }
}

module.exports = new Controller;
