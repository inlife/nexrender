const render = require('../src')

const job = {
    template: {
        src: 'file:///D:/Downloads/nexrender-boilerplate-master/assets/nm05ae12.aepx',

        composition: 'main',
        frameStart: 0,
        frameEnd: 1500,
    },
    assets: [
        {
            src: 'file:///D:/Downloads/nexrender-boilerplate-master/assets/2016-aug-deep.jpg',
            type: 'image',
            layer: 'background.jpg',
        },
        {
            src: 'file:///D:/Downloads/nexrender-boilerplate-master/assets/nm.png',
            type: 'image',
            layer: 'nm.png',
        },
        {
            src: 'file:///D:/Downloads/nexrender-boilerplate-master/assets/deep_60s.mp3',
            type: 'audio',
            layer: 'audio.mp3',
        },
    ]
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
