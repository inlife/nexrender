const server = require("./server");

module.exports = async (job, settings) => {
    settings.logger.log(`[${job.uid}] [action-lottie] finishing`);
    await server.stop(job, settings);
    return job;
};
