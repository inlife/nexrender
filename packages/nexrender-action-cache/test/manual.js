const path = require("path");
const fs = require("fs/promises");
const {existsSync} = require("fs");
const assert = require("assert").strict;
const cacheAction = require("../index.js");

const cacheDirectory = path.join(__dirname, "temp");
const workpathDirectory = path.join(__dirname, "temp_workpath");
const ttl = 1000;
const testJob = {
    workpath: workpathDirectory,
    template: {
        src: "http://example.com/test.aep"
    },
    assets: [
        {
            "src": "https://example.com/assets/image.jpg",
            "type": "image",
            "layerName": "MyNicePicture.jpg"
        }
    ]
};
const settings = {
    logger: {
        log: console.log
    }
};

// Predownload
((async function(){
    let job = JSON.parse(JSON.stringify(testJob));
    await fs.mkdir(cacheDirectory, {recursive: true});

    try{
        await fs.writeFile(path.join(cacheDirectory, "test.aep"), "Some content");
        await fs.writeFile(path.join(cacheDirectory, "image.jpg"), "Not an image");
        await cacheAction(job, settings, {cacheDirectory, ttl, cacheAssets: true}, "predownload");

        assert.equal(job.template.src, `file://${path.join(cacheDirectory, "test.aep")}`);
        assert.deepEqual(job.assets, [
            {
                "src": `file://${path.join(cacheDirectory, "image.jpg")}`,
                "type": "image",
                "layerName": "MyNicePicture.jpg"
            }
        ]);
    }finally{
        await fs.rm(cacheDirectory, {recursive: true, force: true});
    }

    // Postdownload
    job = JSON.parse(JSON.stringify(testJob));
    await fs.mkdir(cacheDirectory, {recursive: true});
    await fs.mkdir(workpathDirectory, {recursive: true});

    try{
        await fs.writeFile(path.join(workpathDirectory, "test.aep"), "Some content");
        await fs.writeFile(path.join(workpathDirectory, "image.jpg"), "Not an image");

        await cacheAction(job, settings, {cacheDirectory, ttl, cacheAssets: true}, "postdownload");

        assert(existsSync(path.join(cacheDirectory, "test.aep")));
        assert(existsSync(path.join(cacheDirectory, "image.jpg")));
    }finally{
        await fs.rm(cacheDirectory, {recursive: true, force: true});
        await fs.rm(workpathDirectory, {recursive: true, force: true});
    }
})());
