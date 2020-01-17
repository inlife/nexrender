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
    assert(job.uid, 'job must have uid');
    assert(job.state, 'job must have state');

    assert(job.template, 'job must have template object defined');
    assert(job.template.src, 'job must have template.src defined');
    assert(job.template.composition, 'job must have template.composition defined');

    job.assets.map(asset => {
        assert(asset, 'job asset should not be empty');
        assert(asset.type, 'job asset must have type defined');

        switch (asset.type) {
            case 'image':
            case 'audio':
            case 'video':
                assert(asset.src, `job asset[${asset.type}] must have src defined`);
                assert(asset.layerName || asset.layerIndex, `job asset[${asset.type}/video] must have either layerName or layerIndex defined`);
                break;

            case 'data':
                assert(asset.layerName || asset.layerIndex, `job asset[${asset.type}] must have either layerName or layerIndex defined`);
                assert(asset.value !== undefined || asset.expression, `job asset[${asset.type}] must have value and/or expression defined`);
                assert(asset.property, `job asset[${asset.type}] must have property defined`);
                break;

            case 'script':
                assert(asset.src, `job asset[${asset.type}] must have src defined`);
                break;

            default:
                assert(false, `unknown job asset type: ${asset.type}`)
        }
    })

    assert(job.actions);

    [].concat(
        job.actions.prerender || [],
        job.actions.postrender || []
    ).map(action => {
        assert(action, `job action must be defined`);
        assert(action.module, `job action must have module defined`);
    });

    return true;
}

module.exports = {
    create,
    validate,
}
