/**
 * Small helper to make a series of sequenced promise calls from an array
 * @param  {Object} value
 * @param  {Array}  handlers
 * @return {Promise}
 */
const PromiseSerial = (job, settings, handlers) => handlers.reduce(
    (cur, handler) => cur.then(handler),
    Promise.resolve(job, settings)
)

/**
 * Export a function creator, which (when provided with type)
 * will create and return appropriate task
 *
 * @param  {string} actionType
 * @return {Function}
 */
module.exports = actionType => (job, settings) => {
    if (settings.logger) settings.logger.log(`[${job.uid}] applying ${actionType} actions...`);

    return PromiseSerial(job, settings, (job.actions[actionType] || []).map(action => (job, settings) => {
        try {
            return require(action.module)(job, settings, action.options);
        } catch (e) {
            return Promise.reject(new Error(`Could not resolve ${actionType} module ${action.module}`))
        }
    }));
}
