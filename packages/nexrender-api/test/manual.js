const { createClient } = require('../src')

const client = createClient({
    host: 'http://localhost:3000',
    secret: 'foobar123123',
})

client.addJob({
    template: {
        provider: 'none',
        src: 'none',
        composition: 'none',
    },
    assets: [
        {
            type: 'none',
            provider: 'http',
            src: 'http:/fooobar.com/src.jpg',
        }
    ]
}).then(result => {
    result.on('created', (job) => {
        console.log('project has been created')
    })

    result.on('started', (job) => {
        console.log('project rendering started');
    })

    result.on('finished', (job) => {
        console.log('project rendering finished');
    })

    result.on('error', (err) => {
        console.log('project rendering error');
    })
}).catch(err => {
    console.log('job creation error:')
    console.log(err.stack)
})
