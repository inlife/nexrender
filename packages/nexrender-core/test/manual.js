const { init, render } = require('../src')

const job = {
    template: {
        provider: 'file',
        src: '/Users/inlife/Downloads/nexrender-boilerplate-master/assets/nm05ae12.aepx',

        composition: 'main',
        frameStart: 0,
        frameEnd: 300,
    },
    assets: [
        {
            type: 'image',
            provider: 'file',
            src: '/Users/inlife/Downloads/nexrender-boilerplate-master/assets/2016-aug-deep.jpg',
            layer: 'background.jpg',
        },
        {
            type: 'image',
            provider: 'file',
            src: '/Users/inlife/Downloads/nexrender-boilerplate-master/assets/nm.png',
            layer: 'nm.png',
        },
        {
            type: 'audio',
            provider: 'file',
            src: '/Users/inlife/Downloads/nexrender-boilerplate-master/assets/deep_60s.mp3',
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
    },
    // onChange: (job, state) => console.log('new job state', state)
}

const settings = {
    logger: console,
    skipCleanup: true,
    renderLogs: true,
}

render(job, init(settings)).then(job => {
    console.log('finished rendering', job)
}).catch(err => {
    console.error(err)
})
