# nexrender-server

Server acts as a single entry point for all your worker nodes, as well as api clients.
Essentially it is an HTTP REST API server with few methods that allow:

* Getting list of jobs
* Getting info about specific job
* Posting new jobs
* Updating existing jobs
* Removing jobs

Server uses process memory to store current list of jobs, and persists them onto disk each time a new job added/updated/removed/etc.
By default job list is persisted to this location: `$HOME/nexrender/database.js`.
Can be overriden by providing `NEXRENDER_DATABASE` env variable before launching the server.

You are able to change ordering of the jobs. By default nexrender is using `oldest-first` (FIFO) type queue.
Can be changed by providing `NEXRENDER_ORDERING` env vartiable before launching the server with such values:
* `oldest-first` - FIFO queue, oldest jobs will be rendered first
* `newest-first` - LIFO queue, newest jobs will be rendered first, oldest will be rendered last
* `random` - Random access queue, jobs will be selected based on random counter
* `priority` - Jobs are selected based on their priority field (default 0), in case of a collision it will choose the oldest one.

If you want to monitor the status of all your running jobs, consider trying our SaaS solution, [Nexrender Cloud](https://www.nexrender.com/products/cloud), which offers enhanced visibility and a range of other cool features. Here is how it looks like:

![Nexrender Cloud Screenshot](https://github.com/user-attachments/assets/4daa7764-7e92-4cab-96a8-7c246c8fbb61)

## Installation

* For binary usage:

```sh
npm install @nexrender/server -g
```

* For programmatic usage:

```sh
npm install @nexrender/server --save
```

## Usage (binary)

Server can be used in 2 modes, binary and programmatic.

```sh
nexrender-server --port 3000 --secret=myapisecret
```

Binary has some options that can be used to configure it, for detailed list please check `help`:

```sh
nexrender-server --help
```

## Usage (programmatic)

Programmatic usage allows to embed the server directly into your application and use it as a controlled server:

```js
const server = require('@nexrender/server')

const port = 3000
const secret = 'myapisecret'

server.listen(port, secret, () => {
    console.log(`Server listening on port ${port}`)
})
```

Or, alternatively you can use `createHandler` method, to integrate it with your custom http server:

```js
const {createHandler} = require('@nexrender/server')
const handler = createHandler('myapisecret')

module.exports = (req, res) => handler(req, res)
````
## API Routes

Here is a short description of all api routes:

### GET `/api/v1/jobs`

Gets list of all jobs, returns an array of json records.

### GET `/api/v1/jobs/:uid`

Gets info about a specific job.

### POST `/api/v1/jobs`

Creates a new job from json passed within a body.
Requires `content-type=application/json` header to be present.

### PUT `/api/v1/jobs/:uid`

Updates an existing job, merges json provided by user with the one that exists in the server memory.
Requires `content-type=application/json` header to be present.


### DELETE `/api/v1/jobs/:uid`

Removes provided job from the server.

### GET `/api/v1/jobs/pickup`

An internal method, used by worker to fetch a random job from the list, and start rendering.
Probably should not be used by users, unless they know what are they doing.

### GET `/api/v1/jobs/pickup/:tags`

An internal method, used by worker to fetch a random job with specific tags from the list, and start rendering. Tags name must be an alphanumeric.
Probably should not be used by users, unless they know what are they doing.

### GET `/api/v1/health`

Can serve as the health check for the service, does not require the secret header to be passed.
Returns 200 always.
