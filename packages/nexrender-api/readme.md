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

Optionally you can provide custom headers that the API client will pass to the server on each request.
```js
const { createClient } = require('@nexrender/api')

const client = createClient({
    host: 'http://my.server.com:3050',
    headers: {
        "Some-Custom-Header": "myCustomValue",
        "Another-Custom-Header": async () => {
            // Perform some operations
            return "EvaluatedValue";
        }
    }
})
```
As shown in the example above, you can provide string value or a function that will be evaluated on each request to generate the header value dynamically. Any value that is not a string nor a function will be ignored.

One should be careful when providing a function (which can be async) to generate a header value, while it does provide more flexibility than just plain strings, functions that takes a long time to resolve can negatively impact performance. For example, if an async function is defined to fetch a header value from a remote database that takes 500ms to resolve, the client will wait 500ms for the header before moving on to make the actual request, for every request. In this case you should try to memoize the function if possible so that the client doesn't have to do a full look up on each request unncessarily.

## Information

Main returned function is `createClient` which allows you to create multiple clients to work with multiple endpoints in case it might be needed.

Instead of returning `Job` object, `client.addJob` returns an event emitter instance, which allows you to bind your callbacks
and handle changes in the Job lifetime. API will be constantly polling the specific API server every `NEXRENDER_JOB_POLLING` ms for changes, and if there will be any - you will be notified.
