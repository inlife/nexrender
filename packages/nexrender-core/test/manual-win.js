const render = require('../src')

const job = {
    template: {
        provider: 'file',
        src: 'D:/Downloads/nexrender-boilerplate-master/assets/nm05ae12.aepx',

        composition: 'main',
        frameStart: 0,
        frameEnd: 1500,
    },
    assets: [
        {
            type: 'image',
            provider: 'file',
            src: 'D:/Downloads/nexrender-boilerplate-master/assets/2016-aug-deep.jpg',
            layer: 'background.jpg',
        },
        {
            type: 'image',
            provider: 'file',
            src: 'D:/Downloads/nexrender-boilerplate-master/assets/nm.png',
            layer: 'nm.png',
        },
        {
            type: 'audio',
            provider: 'file',
            src: 'D:/Downloads/nexrender-boilerplate-master/assets/deep_60s.mp3',
            layer: 'audio.mp3',
        },
    ],
    actions: {
        prerender: [
            { module: __dirname + '/mytest.js' }
        ],
        postrender: [
            { module: __dirname + '/mytest.js' }
        ]
    }
}

const settings = {
    logger: console,
    skipCleanup: true,
}

render(job, settings).then(job => {
    console.log('finished rendering', job)
}).catch(err => {
    console.error(err)
})
