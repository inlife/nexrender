const fs = require("fs");
const path = require("path");

module.exports = async (job, settings, { input, output, type = "dir" }) => {
    if (!input) {
        throw new Error("No input path provided");
    }

    if (!output) {
        throw new Error("No output path provided");
    }

    /* fill absolute/relative paths */
    if (!path.isAbsolute(input)) input = path.join(job.workpath, input);
    if (!path.isAbsolute(output)) output = path.join(job.workpath, output);

    /* create parent directories if needed */
    fs.mkdirSync(path.dirname(output), { recursive: true });

    /* remove existing link if it exists */
    if (fs.existsSync(output)) {
        fs.unlinkSync(output);
    }

    settings.logger.log(`[${job.uid}] creating symbolic link from ${input} to ${output}...`);

    /* create symbolic link */
    try {
        fs.symlinkSync(input, output, type);
    } catch (err) {
        throw new Error(`Failed to create symbolic link: ${err.message}`);
    }

    return job;
};
