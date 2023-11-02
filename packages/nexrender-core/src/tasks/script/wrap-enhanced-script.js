const EnhancedScript = require('./EnhancedScript')

/**
 *   Wrap Enhanced Script
 *   ====================
 *   @author Dilip Ramírez (https://github.com/dukuo | https://notimetoexplain.co)
 *   @autor Based on the work of Potat (https://github.com/dukuo/potat)
 *   @description        Parse a script from a source, and injects a configuration object named ${keyword} based on the "parameters" array of the script asset if any.
 *
 *                       If parameters or functions deriving from the configuration object are being used in the script, but no parameters are set, then it succeeds but
 *                       displays a warning with the missing JSX/JSON matches, and sets all the missing ones to null for a soft fault tolerance at runtime.
 *
 *   @param src                 The JSX script
 *   @param parameters          (Array<Object>)  Argument array described in the Asset JSON object inside the Job description
 *   @param keyword             (String)         Name for the exported variable holding configuration parameters. Defaults to NX as in NeXrender.
 *   @param defaults.null  (Any)            The default value in case the user setted key name on any given `parameter` child object. Defaults to `null`
 *
 *   @return string             (String)         The compiled script with parameter injection outside its original scope to avoid user-defined defaults collision.
 */
const wrapEnhancedScript = (job, settings, { dest, src, parameters = [], keyword, defaults,  /* ...asset */ }) => {
    const enhancedScript = new EnhancedScript(dest, src, parameters, keyword, defaults, job.uid, settings.logger);
    return enhancedScript.build();
}

module.exports = wrapEnhancedScript