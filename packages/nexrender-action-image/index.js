const jimp = require('jimp');

module.exports = async (job, settings, { create, input, output, filters }) => {
    if (!filters || !filters.length) {
        throw new Error('No filters provided');
    }

    let image;

    if (!input && !create) {
        throw new Error('No input or create provided');
    }

    if (!output) {
        throw new Error('No output provided');
    }

    if (!input && create) {
        const [width, height] = create;
        image = new jimp(width, height);
    } else {
        image = await jimp.read(input);
    }

    for (const filter of filters) {
        const { name, args } = filter;

        if (!image[name]) {
            throw new Error(`Filter "${name}" does not exist`);
        }

        image[name](...args);
    }

    await image.writeAsync(output);
}
