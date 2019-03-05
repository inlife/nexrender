const { init, render } = require('../src')

const job = {
    template: {
        src: 'file:///D:/Downloads/nexrender-boilerplate-master/assets/nm05ae12.aepx',
        composition: 'main',

        frameStart: 0,
        frameEnd: 500,
    },
    assets: [
        {
            src: 'file:///D:/Downloads/nexrender-boilerplate-master/assets/2016-aug-deep.jpg',
            type: 'image',
            layerName: 'background.jpg',
        },
        {
            src: 'file:///D:/Downloads/nexrender-boilerplate-master/assets/nm.png',
            type: 'image',
            layerName: 'nm.png',
        },
        {
            src: 'file:///D:/Downloads/nexrender-boilerplate-master/assets/deep_60s.mp3',
            type: 'audio',
            layerName: 'audio.mp3',
        },
        // {
        //     src: 'https://raw.githubusercontent.com/inlife/nexrender-boilerplate/master/assets/2016-aug-deep.js',
        //     type: 'script',
        // },
        {
            type: 'data',
            layerName: 'artist',
            property: 'position',
            value: [0, 250],
            expression: `[5 * time, 250]`,
        },
        {
            type: 'data',
            layerName: 'track name',
            property: 'Source Text',
            value: 'Привет мир',
        }
    ],
    actions: {
        // prerender: [
        //     { module: __dirname + '/mytest.js' }
        // ],
        postrender: [
            {
                module: '@nexrender/action-encode',
                output: 'output.mp4',
                preset: 'mp4',
            }
        ]
    },
    // onChange: (job, state) => console.log('new job state', state)
}

const settings = {
    logger: console,
    skipCleanup: true,
    debug: true,
}

// console.log(JSON.stringify(job))

render(job, init(settings)).then(job => {
    console.log('finished rendering', job)
}).catch(err => {
    console.error(err)
})
