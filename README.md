<p align="center">
    <img src="https://user-images.githubusercontent.com/2182108/52175653-78259600-27af-11e9-8bf7-c7dcb89e00aa.png" />
</p>

<div align="center">
    <a href="https://travis-ci.org/inlife/nexrender"><img src="https://travis-ci.org/inlife/nexrender.svg?branch=next" alt="Build status" /></a>
    <a href="https://www.npmjs.com/package/nexrender"><img src="https://img.shields.io/npm/v/nexrender.svg?maxAge=3600" alt="NPM version" /></a>
    <a href="https://david-dm.org/inlife/nexrender"><img src="https://img.shields.io/david/inlife/nexrender.svg?maxAge=3600" alt="Dependencies" /></a>
    <a href="https://discord.gg/S2JtRcB"><img src="https://discordapp.com/api/guilds/354670964400848898/embed.png" alt="Discord server" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/github/license/inlife/nexrender.svg" alt="license" /></a>
</div>

<br />
<div align="center">
    Automate your Adobe After Effects rendering workflows. Create data-driven and template based videos.
</div>

<div align="center">
    <sub>
        Built with love using nodejs
        &bull; Brought to you by <a href="https://github.com/inlife">@inlife</a>
        and other <a href="https://github.com/inlife/nexrender/graphs/contributors">contributors</a>
    </sub>
</div>

# Introduction

> Note: this is a pre-release version of software. For the stable version please refer to ["stable"](https://github.com/inlife/nexrender/tree/stable) branch.

`nexrender` is a simple, small, carefully designed application with main goal of rendering automation for Adobe After Effects based rendering workflows.

At this point in time the project is mainly targeted at people at least somewhat comfortable with scripting or development,
and that have basic knowledge of `javascript` language and `json` formats.

### Features

* data-driven, dynamic, personalized video rendering
* automated video management, processing and delivery
* network oriented project structure, render farm
* highly modular nature, extensive plugin support
* works only in cli mode, never launches After Effects GUI application
* does not require licenses for Adobe After Effects on any worker machine
* free to use and open source

### How it works

* rendering: It uses Adobe After Effects's aerender command-line interface application.
* compositing: It creates temporary folder, copies project and replaces assets with provided ones.
* personalization: It uses AE's expressions, scripting and compositing (noted above).
* scheduling: It stores projects in local database, managed from anywhere using http api.
* network: It renders project per machine, and can be used to render several projects simultaniously.
* farm: Can be used to render single project on several machines via Multi-Machine Sequence.

### Alternatives

Probably the closest (feature-wise) alternative that exists at the moment is the Datalcay's [Templater](http://dataclay.com/) bot edition.
Compared to nexrender it has a rich GUI support and a number of enterprise scale features, however it is not free.

# Installation

You can download binaries directly from the [releases](https://github.com/inlife/nexrender/releases) section,
or install them using npm, whichever option works better for you.

However, please note: the npm version of the binaries doesn't include all optional `plugin` packages that are covered in the usage section.
If you wish to install them as well, please do so by providing each one individually:

```
npm i -g @nexrender/cli @nexrender/action-copy ...
```

# Usage

We will be using `nexrender-cli` binary for this example. It's recommended to download/install it if you haven't already.

## Job

Job is a single working unit in the nexrender ecosystem. It is a json document, that describes what should be done, and how it should be done.
Minimal job description always should contain a pointer onto Adobe After Effects project, which is needed to be rendered, and a composition that will be used to render.

Pointer is `src` (string) field containing a URI pointing towards specified file, followed by `composition` (string) field, containing name of the compoisition that needs to be rendered.

```json
// myjob.json
{
    "template": {
        "src": "file:///users/myuser/documents/myproject.aep",
        "composition": "main"
    }
}
```

or for remote file accessible via http

```json
// myjob.json
{
    "template": {
        "src": "http://example.com/myproject.aep",
        "composition": "main"
    }
}
```

Submitting this data to the binary will result in start of the rendering process:

```sh
$ nexrender-cli '{"template":{"src":"file:///d:/documents/myproject.aep","composition":"main"}}'
```

or more conviniently using `--file` option

```sh
$ nexrender-cli --file=myjob.json
```

> Note: its recommended to run `nexrender-cli -h` at least once, to read all useful information about available options.

### Assets

We've successfully rendered a static project file using nexrender, however there is no much point doing that unless we
are going to add some dynamic data in to the mix.

A way to implement something like that is to add an `asset` to our job definition:

```json
// myjob.json
{
    "template": {
        "src": "file:///d:/documents/myproject.aep",
        "composition": "main"
    },
    "assets": [
        {
            "src": "file:///d:/images/myimage.png",
            "type": "image",
            "layer": "background"
        }
    ]
}
```

What we've done there is we told nexrender to use a particlar asset as a replacement for something that we had defined in our `aep` project.
More specifically, when rendering is gonna happen, nexrender will copy/download this asset file, and attemt to find and replace `footage` entry by specified layer name.

Fields:

* `src`: string, a URI pointer to the specific resource
* `type`: string, one of (`image, audio, video, script, expression`)
* `layer`: string, target layer name in the After Effects project, which will be used to find footage item that will be replaced
* any additional fields specific for particular URIs or asset types

### Actions

You might've noticed that unless you added `--skip-cleanup` flag to our command, all rendered results will be deleted,
and a big warning message will be shown every time you attempt to run the `nexrender-cli` with our job.

The reason is that we haven't defined any actions that we need to do after we finished actual rendering. Let's fix that and add a simple one, copy.

```json
// myjob.json
{
    "template": {
        "src": "file:///d:/documents/myproject.aep",
        "composition": "main"
    },
    "assets": [
        {
            "src": "file:///d:/images/myimage.png",
            "type": "image",
            "layer": "background"
        }
    ],
    "actions":{
        "postrender": [
            {
                "module": "@nexrender/action-copy",
                "output": "d:/mydocuments/results/myresult.avi"
            }
        ]
    }
}
```

We've just added a `postrender` action, that will occur right after we finished rendering.
Module that we described in this case, is responsible for copying result file from a temp folder to the `output` folder.

There are multiple built-in modules within nexrender ecosystem:

* [@nexrender/action-copy](https://github.com/inlife/nexrender/tree/master/packages/nexrender-action-copy)
* [@nexrender/action-upload](https://github.com/inlife/nexrender/tree/master/packages/nexrender-action-upload)
* (list will be expanded)

Every module might have his own set of fields, however `module` field is always there.

Also you might've noticed that `actions` is an object, however we described only one (`postrender`) field in it.
And there is one more, its called `prerender`. The latter one can be used to process data/assets just before the actual render will start.

Also, if you are planning on having more than one action, please note: **actions are order-sensetive**,
that means if you put let's say some encoding action after upload, the latter one might not be able to find a file that needs to be generated by former one,
since the ordering was wrong.

If you have at least some experience with `Node.js`, you might've noticed that the `module` definition looks exactly like a package name.
And well, yes it is. When nexrender stumbles upon a `module` entry, it will try to require this package from internal storage,
and then if no module has been found, it will attempt to look for globally installed Node.js modules with that name.

That means if you are comfortable with writing `Node.js` code, you can easily create your own module, and use it by
providing either absolute/relative path (on local machine), or publishing the module and installing it globally on your target machine.

```sh
npm i -g my-awesome-nexrender-action
```

And then using it:

```json
{
    "actions":{
        "postrender": [
            {
                "module": "my-awesome-nexrender-action",
                "param1": "something big",
                "param2": 15
            }
        ]
    }
}
```

Also you can [checkout packages](#external-packages) made by other contributors across the network:

### Details

Job structure has more fields, that we haven't checked out yet. The detailed version of the structure looks like this:

```js
{
    "template": {
        "src": String,
        "composition": String,

        "frameStart": Number,
        "frameEnd": Number,
        "frameIncrement": Number,

        "continueOnMissing": Boolean,
        "settingsTemplate": String,
        "outputModule": String,
        "outputExt": String,
    },
    "assets": [],
    "actions": {
        "prerender": [],
        "postrender": [],
    },
    "onChange": Function
}
```

Majority of the fields are just proxied to the `aerender` binary, and their descriptions and default
values can be checked [here](https://helpx.adobe.com/after-effects/using/automated-rendering-network-rendering.html).

`onChange` is a field that is possible to setup only via programamtic use.
It is a callback which will be triggered every time the job has change state (happens on every task change).
For more info please refer to the source code.

## Programmatic

In case you are building your own application and just need to use a rendering part, or you wanna manually trigger jobs from your code,
there is a way to use nexrender programmatically:

Install the [@nexrender/core](https://github.com/inlife/nexrender/tree/master/packages/nexrender-core)

```sh
$ npm install @nexrender/core --save
```

And then load it, and run it

```js
const { init, render } = require('@nexrender/core')

const settings = init({
    logger: console,
})

const main = async () => {
    const result = await render(/*myJobJson*/, settings)
}

main();
```

# Network rendering

We've covered basics on how to set up a minimal rendering flow using local cli machine rendering.
Now, what if you want to start rendering on a remote machine, to reduce load while you are working on your local machine.
Or maybe you need to render so many videos at once, that you will require a whole fleet of nodes running on some cloud cluster.

With nexrender you can quite quickly and easily spin up your own rendering cluster.

## Using binaries

You can download compiled versions of binaries directly from the [releases](https://github.com/inlife/nexrender/releases) section,
or install them using npm, whichever option works better for you.

### `nexrender-server`

#### Description:
A CLI application which is responsible for job management, worker node cooperation,
communications with the `nexrender-worker` instances, and serves mainly as a producer in the nexrender network model.

Technically speaking its a very tiny HTTP server running with a minimal version of REST API.

#### Supported platforms:
Windows, macOS, Linux

#### Requirements:
None

#### Example

```sh
$ nexrender-server \
        --port=3050 \
        --secret=myapisecret
```

### `nexrender-worker`

#### Description:
A CLI application which is responsible mainly for actual job processing and rendering,
communication with the `nexrender-server`, and serves mainly as a consumer in the nexrender network model.

#### Supported platforms:
Windows, macOS

#### Requirements:
Installed licensed/trial version of Adobe After Effects

#### Example

```sh
$ nexrender-worker \
        --host=https://my.server.com:3050 \
        --secret=myapisecret
```

> Note: its recommended to run `nexrender-worker -h` at least once, to read all useful information about available options.

## Using API

Now, after you've loaded up your worker and server nodes, they will need some jobs to be submitted to the server to start actual rendering.
There are 2 main ways to do that, first one - just send a direct POST request to add a job to the server.

```sh
curl \
    --request POST \
    --header "nexrender-secret: myapisecret" \
    --header "content-type: application/json" \
    --data '{"template":{"src":"http://my.server.com/assets/project.aep","composition":"main"}}' \
    http://my.server.com:3050/api/v1/jobs
```

Other option is to use already created API module for js:

```sh
npm isntall @nexrender/api --save
```

```js
const { createClient } = require('@nexrender/api')

const client = createClient({
    host: 'http://my.server.com:3050',
    secret: 'myapisecret',
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
    result.on('finished', job) => console.log('project rendering finished'))
    result.on('error', err => console.log('project rendering error', err))
}

main()
```

# External Packages

Here you can find a list of packages published by other contributors:

* [somename/package-name](#) - a nice description of a nice package doing nice things

# Plans

1. Encoding using ffmpeg `@nexrender/action-encode`
2. Uploading to various providers `@nexrender/action-upload`
3. Algo of splitting the main job onto subjobs, rendering them on multiple machines
and then combining back into a single job. `@nexrender/action-merge-parent, @nexrender/action-merge-child`
4. Adding more upload/download providers
5. Creating fully-enclosed binary builds containing majority of the @nexrender/* npm modules

