const { createClient } = require('../src')

const client = createClient({
    host: 'http://localhost:3000',
    secret: 'myapisecret',
})

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
            layerName: 'background.jpg',
        },
        {
            type: 'image',
            provider: 'file',
            src: '/Users/inlife/Downloads/nexrender-boilerplate-master/assets/nm.png',
            layerName: 'nm.png',
        },
        {
            type: 'audio',
            provider: 'file',
            src: '/Users/inlife/Downloads/nexrender-boilerplate-master/assets/deep_60s.mp3',
            layerName: 'audio.mp3',
        },
    ],
    // onChange: (job, state) => console.log('new job state', state)
}

// Test with events
client.addJob(job).then(result => {
    result.on('created', (/* job */) => {
        console.log('project has been created')
    })

    result.on('started', (/* job */) => {
        console.log('project rendering started');
    })

    result.on('finished', (/* job */) => {
        console.log('project rendering finished');
    })

    // eslint-disable-next-line
    result.on('error', (/* err */) => {
        console.log('project rendering error');
    })
}).catch(err => {
    console.log('job creation error:')
    console.log(err.stack)
})

// Test without events
client.addJob(job, {withEvents: false}).then(job => {
    console.log('job', job)
}).catch(err => {
    console.log('job creation error:')
    console.log(err.stack)
})
