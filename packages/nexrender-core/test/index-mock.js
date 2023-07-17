// simple test code
const {render} = require('../src')

process.env.NEXRENDER_ENABLE_AELOG_PROJECT_FOLDER = true

const job = {
    template: {
        src: 'data:text/plain,Hello, World!',
        composition: 'test',
        output: __dirname + '/index.js',
    },
    assets: [
        {
            type: 'image',
            src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==',
            layerName: 'test',
        }
    ]
}

const settings = {
    binary: __dirname + '/aerender',
    workpath: __dirname + '/workpath',
}

render(job, settings)
    .then(() => console.log('rendered successfully'))
    .catch(console.error)
