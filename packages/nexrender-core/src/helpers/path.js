/**
 * Expand environment variables
 * Example:
 * Assuming $NEXRENDER_ASSETS is set to /Users/max/nexrender
 * in the environment of the current process
 * an input of file://$NEXRENDER_ASSETS/projects/project2.aep
 * would output: file:///Users/max/nexrender/projects/project2.aep
 */
function expandEnvironmentVariables(pathString) {
    const sigiledStrings = pathString.match(/\$.\w*/g) || [];

    return sigiledStrings.reduce((accumulator, sigiledString) => {
        const potentialEnvVarKey = sigiledString.replace("$", "");

        if (process.env.hasOwnProperty(potentialEnvVarKey)) {
            return accumulator.replace(
                sigiledString,
                process.env[potentialEnvVarKey]
            );
        } else {
            return accumulator;
        }
    }, pathString);
}

module.exports = {
    expandEnvironmentVariables: expandEnvironmentVariables
};
