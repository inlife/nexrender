# API

If you want to use nexrender API from browser/nodejs env you can use this module, instead of manually sending HTTP requests.

## Installation

```sh
npm install @nexrender/api --save
```

## Usage

```js
const { createClient } = require('@nexrender/api')

const client = createClient({
    host: 'http://my.server.com:3050',
    secret: 'myapisecret',
    polling: 3000, // fetch udpates every 3000ms
})

const main = async () => {
    const result = await client.addJob({
        template: {
            src: 'http://my.server.com/assets/project.aep',
            composition: 'main',
        }
    })

    result.on('created', job => console.log('project has been created'))
    result.on('started', job => console.log('project rendering started'))
    result.on('progress', (job, percents) => console.log('project is at: ' + percents + '%'))
    result.on('finished', job => console.log('project rendering finished'))
    result.on('error', err => console.log('project rendering error', err))
}

main().catch(console.error);
```

## Information

Main returned function is `createClient` which allows you to create multiple clients to work with multiple endpoints in case it might be needed.

Instead of returning `Job` object, `client.addJob` returns an event emitter instance, which allows you to bind your callbacks
and handle changes in the Job lifetime. API will be constantly polling the specific API server every `NEXRENDER_JOB_POLLING` ms for changes, and if there will be any - you will be notified.
