const assert = require('assert')
const { nanoid } = require('nanoid')

/**
 * Take an optional minimal job json/object
 * and return a properly structured job object
 *
 * @param  {Object} job optional
 * @return {Object}
 */
const create = job => Object.assign({
    uid: job.uid ? job.uid : nanoid(),
    type: 'default',
    state: 'created',
    output: '',
    tags: '',
    priority: job.priority ? job.priority : 0,

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

        renderSettings: undefined,
        outputSettings: undefined,
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
            case 'static':
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

/**
 * Returns a lightweight representation of the job. Containing only rendering infos.
 * @param  {Object} job
 * @return {Object} {uid: string, state: string, type: string, renderProgress: number, error: string}
 */
const getRenderingStatus = job => ({
    uid: job.uid,
    state: job.state,
    type: job.type,
    tags: job.tags || null,
    renderProgress: job.renderProgress || 0,
    error: (job.error && Array.isArray(job.error) ? job.error.join('\n\n') : job.error) || null,
    createdAt: job.createdAt || null,
    updatedAt: job.updatedAt || null,
    startedAt: job.startedAt || null,
    finishedAt: job.finishedAt || null,
    errorAt: job.errorAt || null,
    jobCreator: job.creator,
    jobExecutor: job.executor || null
})

module.exports = {
    create,
    validate,
    getRenderingStatus,
}
