'use strict';

const setup         = require('./tasks/setup');
const download      = require('./tasks/download');
const rename        = require('./tasks/rename');
const filter        = require('./tasks/filter');
const render        = require('./tasks/render');
const cleanup       = require('./tasks/cleanup');

class Renderer {

    /**
     * @param  {Project}
     * @return {Promise}
     */
    render(project) {
        return new Promise((resolve, reject) => {
            project
                .prepare()
                .then(setup)
                .then(download)
                .then(rename)
                // .then(filter)
                // .then(render)
                // .then(cleanup)
                .then((project) => {
                    // run post actions
                    resolve(project);
                })
                .catch(reject);
        });
    }
}

module.exports = new Renderer;