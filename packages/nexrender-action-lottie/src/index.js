const fs = require("fs");
const url = require("url");
const path = require("path");
const server = require("./server");
const { lottiePaths, lottieSettings } = require("./defaults");

const createScript = ({ composition, logPath, bodymovinPath, serverUrl, outputPath, lottiePaths, lottieSettings }) => {
    return {
        type: "script",
        src: url.pathToFileURL(path.join(__dirname, "..", "scripts", "lottie-initiator.jsx")).toString(),
        parameters: [
            { type: "string", key: "logPath", value: logPath },
            { type: "string", key: "bodymovinPath", value: bodymovinPath },
            { type: "string", key: "serverUrl", value: serverUrl },
            { type: "array", key: "lottiePaths", value: lottiePaths },
            { type: "object", key: "lottieSettings", value: lottieSettings },
            { type: "string", key: "composition", value: composition },
            { type: "string", key: "outputPath", value: outputPath },
        ],
    };
};

module.exports = async (job, settings, { params = {} }) => {
    settings.logger.log(`[${job.uid}] [action-lottie] starting`);
    const port = await server.start(job, settings);

    job.template.frameStart = 0;
    job.template.frameEnd = 1;

    if (!job.assets) job.assets = [];
    if (!job.actions) job.actions = {};
    if (!job.actions.prerender) job.actions.prerender = [];
    if (!job.actions.postrender) job.actions.postrender = [];

    console.log('version', 1)
    console.log(fs.readdirSync(path.join(__dirname, "..", "lib")))
    console.log(fs.readdirSync(path.join(__dirname, "..", "lib", "jsx")))

    // copy recursively all files from the lib folder to the job.workpath
    fs.cpSync(path.join(__dirname, "..", "lib"), path.join(job.workpath, "lib"), { recursive: true });

    // add lottie prerender finish script
    settings.logger.log(`[${job.uid}] [action-lottie] adding lottie prerender finish script`);
    job.actions.postrender.unshift({
        module: path.join(__dirname, "finish.js"),
    });

    // add text-to-image layer script
    settings.logger.log(`[${job.uid}] [action-lottie] adding text-to-image layer script`);
    job.assets.push({
        type: "script",
        src: url.pathToFileURL(path.join(__dirname, "..", "scripts", "text-to-image-layer.jsx")).toString(),
        parameters: [
            { type: "string", key: "composition", value: job.template.composition },
        ],
    });

    const preparedLottieSettings = Object.assign({}, lottieSettings, {
        banner: Object.assign({}, lottieSettings.banner, {
            lottie_origin: params.lottie_origin || "local",
            lottie_renderer: params.lottie_renderer || "svg",
            lottie_library: params.lottie_library || "full",
            use_original_sizes: params.use_original_sizes === undefined ? true : params.use_original_sizes,
            width: params.width === undefined ? 500 : params.width,
            height: params.height === undefined ? 500 : params.height,
            click_tag: params.click_tag || "#",
            shouldLoop: params.shouldLoop === undefined ? true : params.shouldLoop,
            loopCount: params.loopCount === undefined ? 0 : params.loopCount,
        }),
    });

    // // ln -s (Footage) folder to the temp workdir
    // fs.symlinkSync(
    //     path.resolve(path.join(__dirname, "..", "scripts", "forward")),
    //     path.resolve(path.join(job.workpath, 'assets')),
    //     'junction'
    // );

    // add lottie initiator script
    settings.logger.log(`[${job.uid}] [action-lottie] adding lottie initiator script`);
    job.assets.push(createScript({
        composition: job.template.composition,
        logPath: path.join(job.workpath, "lottie.log"),
        bodymovinPath: path.join(job.workpath, "lib", "jsx"),
        serverUrl: `localhost:${port}`,
        outputPath: path.join(job.workpath, '--banner--'), // will be placed in the FolderName of the provided path (/uid/banner/)
        lottiePaths,
        lottieSettings: preparedLottieSettings,
    }));

    settings.logger.log(`[${job.uid}] [action-lottie] job preconfigured`);

    return job;
};
