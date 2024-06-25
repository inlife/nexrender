const action = require("./index.js");
const assert = require("assert");
const fs = require("fs");
const path = require("path");

describe("action/image", () => {
    it("should throw an error if no filters are provided", async () => {
        const job = {};
        const settings = {};
        const params = {
            input: 'foobar',
            output: 'foobar',
        };

        try {
            await action(job, settings, params);
        } catch (err) {
            assert.equal(err.message, "No filters provided");
        }
    });

    it("should throw an error if no input or create is provided", async () => {
        const job = {};
        const settings = {};
        const { create, input, output, filters } = {filters: [{}]};

        try {
            await action(job, settings, { create, input, output, filters });
        } catch (err) {
            assert.equal(err.message, "No input or create provided");
        }
    });

    it("should throw an error if no output is provided", async () => {
        const job = {};
        const settings = {};
        const { create, input, output, filters } = {input: 'foobar', filters: [{}]};

        try {
            await action(job, settings, { create, input, output, filters });
        } catch (err) {
            assert.equal(err.message, "No output provided");
        }
    });

    const imagePath = path.join(__dirname, "test.png");

    it("should create a new image with the provided dimensions", async () => {
        const job = {};
        const settings = {};
        const create = [21, 21];
        const output = imagePath;
        const filters = [
            { name: "background", args: [0xFFFFFF] },
            { name: "setPixelColor", args: [0xFF0000FF, 10, 10] },
            { name: "setPixelColor", args: [0xFF0000FF, 9, 10] },
            { name: "setPixelColor", args: [0xFF0000FF, 11, 10] },
            { name: "setPixelColor", args: [0xFF0000FF, 10, 9] },
            { name: "setPixelColor", args: [0xFF0000FF, 10, 10] },
            { name: "setPixelColor", args: [0xFF0000FF, 10, 11] },
        ];

        await action(job, settings, { create, output, filters });

        // assert that the image was created
        assert.ok(fs.existsSync(output));
    });

    it("should apply filters to the input image", async () => {
        const job = {};
        const settings = {};

        const input = imagePath;
        const output = imagePath + ".jpg";

        const filters = [
            { name: "greyscale", args: [] },
            { name: "invert", args: [] },
        ];

        await action(job, settings, { input, output, filters });

        // assert that the image was created
        assert.ok(fs.existsSync(output));
    });

    after(() => {
        fs.unlinkSync(imagePath);
        fs.unlinkSync(imagePath + ".jpg");
    });
})
