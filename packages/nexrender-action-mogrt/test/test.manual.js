process.env.NEXRENDER_ENABLE_AELOG_PROJECT_FOLDER = 1;

const path = require('path');
const url = require('node:url');
const { render } = require("../../nexrender-core");

const job = {
    template: {
        src: url.pathToFileURL(path.join(__dirname, './assets/ae.mogrt')).href,
        composition: 'ignored',
        // continueOnMissing: true,
    },

    assets: [
        {
            type: 'image',
            layerName: 'ref-image-layer',
            src: 'https://png.pngtree.com/thumb_back/fh260/background/20220216/pngtree-blue-small-square-background-vector-material-technology-shading-image_973639.jpg',
        }
    ],

    actions: {
        predownload: [
            {
                module: require.resolve('../index.js'),
                params: {
                    'Group Test': {
                        'Image': 'ref-image-layer'
                    }
                }
            }
        ]
    }
};

const main = async () => {
    console.log(job)

    await render(job, {
        debug: true,
        skipCleanup: true,
    });
}

main().catch(console.error);
