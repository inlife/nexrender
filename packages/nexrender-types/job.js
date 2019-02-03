const assert = require('assert')
const nanoid = require('nanoid')

/**
 * Take an optional minimal job json/object
 * and return a properly structured job object
 *
 * @param  {Object} job optional
 * @return {Object}
 */
const create = job => Object.assign({
    uid: nanoid(),
    type: 'default',
    state: 'created',
    output: '',

    template: {
        src: '',
        composition: '',

        frameStart: undefined,
        frameEnd: undefined,
        frameIncrement: undefined,

        continueOnMissing: false,
        settingsTemplate: undefined,
        outputModule: undefined,
        outputExt: undefined,
        imageSequence: false,
    },
    assets: [],
    actions: {
        prerender: [],
        postrender: [],
    },
}, job || {})

/**
 * Validate a job object
 * @param  {Object} job
 * @return {Boolean}
 */
const validate = job => {
    assert(job.uid);
    assert(job.state);

    assert(job.template);
    assert(job.template.src);
    assert(job.template.composition);

    job.assets.map(asset => {
        assert(asset);
        assert(asset.src);
        assert(asset.type);
    })

    assert(job.actions);

    [].concat(
        job.actions.prerender,
        job.actions.postrender
    ).map(action => {
        assert(action);
        assert(action.module);
    });

    return true;
}

module.exports = {
    create,
    validate,
}
