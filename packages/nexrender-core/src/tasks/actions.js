const requireg = require('requireg')

/**
 * Small helper to make a series of sequenced promise calls from an array
 * @param  {Object} value
 * @param  {Array}  handlers
 * @return {Promise}
 */
const PromiseSerial = handlers => handlers.reduce(
    (cur, handler) => cur.then(handler), Promise.resolve()
)

/**
 * Export a function creator, which (when provided with type)
 * will create and return appropriate task
 *
 * @param  {string} actionType
 * @return {Function}
 */
module.exports = actionType => (job, settings, updateJob) => {
    settings.logger.log(`[${job.uid}] applying ${actionType} actions...`);

    return PromiseSerial((job.actions[actionType] || []).map(action => () => {
        if(settings.actions && settings.actions[action.module]){
            return settings.actions[action.module](job, settings, action, actionType, updateJob);
        }else{
            return requireg(action.module)(job, settings, action, actionType, updateJob).catch(err => {
                return Promise.reject(new Error(`Error loading ${actionType} module ${action.module}: ${err}`));
            });
        }
    })).then(() => {
        return Promise.resolve(job)
    });
}
