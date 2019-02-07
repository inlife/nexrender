<p align="center">
    <img src="https://user-images.githubusercontent.com/2182108/52175653-78259600-27af-11e9-8bf7-c7dcb89e00aa.png" />
</p>

<div align="center">
    <a href="https://travis-ci.org/inlife/nexrender"><img src="https://travis-ci.org/inlife/nexrender.svg?branch=master" alt="Build status" /></a>
    <a href="https://www.npmjs.com/package/@nexrender/core"><img src="https://img.shields.io/npm/v/@nexrender/core.svg?maxAge=3600" alt="NPM version" /></a>
    <a href="https://david-dm.org/inlife/nexrender?path=packages/nexrender-core"><img src="https://david-dm.org/inlife/nexrender/status.svg?path=packages/nexrender-core" alt="Dependencies" /></a>
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

> Note: this is a pre-release version of the software. For the stable version please refer to ["stable"](https://github.com/inlife/nexrender/tree/stable) branch.

`nexrender` is a simple, small, carefully designed application with the main goal of rendering automation for Adobe After Effects based rendering workflows.

At this point in time, the project is mainly targeted at people at least somewhat comfortable with scripting or development,
and that have basic knowledge of `javascript` language and `json` formats.

### Features

* data-driven, dynamic, personalized video rendering
* automated video management, processing, and delivery
* network oriented project structure, render farm
* highly modular nature, extensive plugin support
* works only in cli mode, never launches After Effects GUI application
* does not require licenses for Adobe After Effects on any worker machine
* free to use and open source

### How it works

* rendering: It uses Adobe After Effects' aerender command-line interface application.
* compositing: It creates a temporary folder, copies project and replaces assets with provided ones.
* personalization: It uses AE's expressions, scripting, and compositing (noted above).
* scheduling: It stores projects in a local database, managed from anywhere using http api.
* network: It renders project per machine, and can be used to render several projects simultaneously.
* farm: Can be used to render a single project on several machines via Multi-Machine Sequence.

### Alternatives

Probably the closest (feature-wise) alternative that exists at the moment is the Datalcay's [Templater](http://dataclay.com/) bot edition.
Compared to nexrender it has a rich GUI support and a number of enterprise-scale features, however, it is not free.

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

A job is a single working unit in the nexrender ecosystem. It is a json document, that describes what should be done, and how it should be done.
Minimal job description always should contain a pointer onto Adobe After Effects project, which is needed to be rendered, and a composition that will be used to render.

The pointer is `src` (string) field containing a URI pointing towards specified file, followed by `composition` (string) field, containing the name of the composition that needs to be rendered.

>Note: check out [supported protocols](#protocols) for `src` field.

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

or more conveniently using `--file` option

```sh
$ nexrender-cli --file myjob.json
```

> Note: its recommended to run `nexrender-cli -h` at least once, to read all useful information about available options.

More info: [@nexrender/cli](packages/nexrender-cli)

### Assets

We've successfully rendered a static project file using nexrender, however, there is no much point doing that unless we
are going to add some dynamic data into the mix.

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
            "layerName": "background"
        }
    ]
}
```

What we've done there is we told nexrender to use a particular asset as a replacement for something that we had defined in our `aep` project.
More specifically, when rendering is gonna happen, nexrender will copy/download this asset file, and attempt to find and replace `footage` entry by specified layer name.

Check out: [detailed information about footage items](#footage-items).

### Actions

You might've noticed that unless you added `--skip-cleanup` flag to our command, all rendered results will be deleted,
and a big warning message will be shown every time you attempt to run the `nexrender-cli` with our job.

The reason is that we haven't defined any actions that we need to do after we finished actual rendering. Let's fix that and add a simple one, copy.

```json
// myjob.json
{
    "template": {
        "src": "http://example.com/assets/myproject.aep",
        "composition": "main"
    },
    "assets": [
        {
            "src": "http://example.com/assets/myimage.png",
            "type": "image",
            "layerName": "background"
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
A module that we described in this case, is responsible for copying result file from a temp folder to the `output` folder.

There are multiple built-in modules within nexrender ecosystem:

* [@nexrender/action-copy](https://github.com/inlife/nexrender/tree/master/packages/nexrender-action-copy)
* [@nexrender/action-upload](https://github.com/inlife/nexrender/tree/master/packages/nexrender-action-upload)
* (list will be expanded)

Every module might have his own set of fields, however, `module` field is always there.

Also, you might've noticed that `actions` is an object, however, we described only one (`postrender`) field in it.
And there is one more, its called `prerender`. The latter one can be used to process data/assets just before the actual render will start.

Also, if you are planning on having more than one action, please note: **actions are order-sensitive**,
that means if you put let's say some encoding action after upload, the latter one might not be able to find a file that needs to be generated by former one,
since the ordering was wrong.

If you have at least some experience with `Node.js`, you might've noticed that the `module` definition looks exactly like a package name.
And well, yes it is. When nexrender stumbles upon a `module` entry, it will try to require this package from internal storage,
and then if no module has been found, it will attempt to look for globally installed Node.js modules with that name.

That means if you are comfortable with writing `Node.js` code, you can easily create your own module, and use it by
providing either absolute/relative path (on a local machine), or publishing the module and installing it globally on your target machine.

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

Also, you can [checkout packages](#external-packages) made by other contributors across the network:

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

`onChange` is a field that is possible to setup only via programmatic use.
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

main().catch(console.error);
```

More info: [@nexrender/core](packages/nexrender-core)

# Template rendering

One of main benefits of using nexrender is an ability to render projects using data other than what have been used while project has been created.
Data means any sort of source/footage material, it can be images, audio tracks, video clips, text strings, values for colors/positions, even dynamic animations using expressions.
All of those things can be replaced for every job without even opening project file or starting After Effects.

> Note: Also this process can be called in other ways: **templated**, **data-driven** or **dynamic** video generation.

This approach allows you to create a .aep file once, and then reuse it for as many target results as you need to.
However, what is needed to get started?

## Footage items

Footage item replacement is what breifly has been covered in `Job` section of this document.
The idea is quite simple, you describe which asset will replace existing described footage item in specific layer,
by specifying `src`, and one of the `layerName` or `layerIndex` options.

### Fields

* `src`: string, a URI pointer to the specific resource, check out [supported protocols](#protocols)
* `type`: string, for footage items is one of (`image`, `audio`, `video`)
* `layerName`: string, target layer name in the After Effects project
* `layerIndex`: integer, additonally instead of `layerName` you can select layer by providing an index
of the layer instead of maching by name starting from 1 (default behavior of AE jsx scripting env)

Specified asset from `src` field will be downloaded/copied to the working directory, and just before rendering will happen,
fotage item with specified `layerName` or `layerIndex` in the original project will be replaced with the freshly downloaded asset.

This way you (if you are using network rendering) you can not only deliver assets to the target platform, but also dynamically replace them.

### Example

```json
{
    "assets": [
        {
            "src": "https://example.com/assets/image.jpg",
            "type": "image",
            "layerName": "MyNicePicture.jpg"
        },
        {
            "src": "file:///home/assets/audio.mp3",
            "type": "audio",
            "layerIndex": 15
        }
    ]
}
```

## Data items

Second important point for the dynamic data-driven video generation is ability to replace/change/modify non-footage data in the project.
To do that a special asset of type `data` can be used.

### Fields

* `type`: string, for data items is always `data`
* `layerName`: string, target layer name in the After Effects project
* `layerIndex`: integer, additonally instead of `layerName` you can select layer by providing an index
of the layer instead of maching by name starting from 1 (default behavior of AE jsx scripting env)
* `property`: string, indicates which layer property you want to change
* `value`: mixed, optional, indicates which value you want set to specified property
* `expression`: string, optional, allows you to specify an expression that can be executed every frame to calculate the value

Since both `value` and `expression` are optional you can provide them in any combination, depending on the effect you want to achieve.
Providing value will set the exact value for the property right after execution, and providing an expression will make sure it will be evaluated every frame.

>Note: If you are not sure what expressions are, and how to use them, please refer [to this page](https://helpx.adobe.com/after-effects/using/expression-basics.html)

And if you are not sure what is a `property` and where to get it you can refer to this image:

<details>
<summary><b>Property List Example</b></summary>

>As you can see there are a few `Property Groups` like Text, Masks, Transform that include actual properties. Those properties is what can be used as target.

![](https://user-images.githubusercontent.com/2182108/52443468-7270dd00-2b2e-11e9-8336-255349279c43.png)

</details>

### Example

```json
{
    "assets": [
        {
            "type": "data",
            "layerName": "MyNicePicture",
            "property": "Position",
            "value": [500, 100]
        },
        {
            "type": "data",
            "layerName": "my text field",
            "property": "Source Text",
            "expression": "time > 100 ? 'Bye bye' : 'Hello world'"
        },
        {
            "type": "data",
            "layerIndex": 15,
            "property": "Scale",
            "value": [0,0],
            "expression": "[time * 0.1, time * 0.1]"
        }
    ]
}
```

>Note: any error in expression will prevent project from rendering. Make sure to read error messages reported by After Effects binary carefuly.

## Script items

The last and the most complex and yet the most powerful, is an ability to execute custom `jsx` scripts just before the rendering will start.
This approach allows you to do pretty much anyhting that is allowed for scripting,
like creating/removing layers, adding new elements, restructuring whole composition, and probably much more.

Now, actual complexity happens only from the side of actual scripting, you need to have some basic knowledge of `ExtendScript Toolkit`,
and from the nexrender side everything is quite simple. You only need to provide an `src` pointing towards script resource, and setup proper type.

### Fields

* `src`: string, a URI pointer to the specific resource, check out [supported protocols](#protocols)
* `type`: string, for script items is always `script`

### Example

```json
{
    "assets": [
        {
            "src": "http://example.com/scripts/myscript.jsx",
            "type": "script"
        }
    ]
}
```

That pretty much covers basics of templated rendering.

# Network rendering

We've covered basics on how to set up a minimal rendering flow using local cli machine rendering.
Now, what if you want to start rendering on a remote machine, to reduce load while you are working on your local machine.
Or maybe you need to render so many videos at once, that you will require a whole fleet of nodes running on some cloud cluster.

With nexrender, you can quite quickly and easily spin up your own rendering cluster.

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

More info: [@nexrender/server](packages/nexrender-server)

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

More info: [@nexrender/worker](packages/nexrender-worker)

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

Another option is to use already created API module for js:

```sh
npm install @nexrender/api --save
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
    result.on('finished', job => console.log('project rendering finished'))
    result.on('error', err => console.log('project rendering error', err))
}

main().catch(console.error);
```

More info: [@nexrender/api](packages/nexrender-api)

# Development

If you wish to contribute by taking an active part in development, you might need this basic tutorial on how to get started:

1. clone the repo
2. run `npm install`
3. run `npm start`

The last command will run [lerna](https://lernajs.io/) bootstrap action to setup dependencies for all packages listed in the `packages/` folder,
and link them together accordingly to their dependency relations.

After that, you can start the usual development flow of writing code and testing it with `npm start` in a specific package.

Why this multi-package structure has been chosen? It seemed like a much smarter and easier way to achieve a few things:
1. separation of concerns, every module is responsible for a limited set of things
2. modularity and plugin-friendly nature, which allows external packages to be used instead, or alongside built-in ones
3. minimal dependency, as you might've noticed, packages in nexrender try to have as little dependencies as possible
making it much easier to maintain and develop

The recommended approach is to add only needed things as dependencies, it's better to take some time to research module that is being added
to the project, to see how many its own dependencies it will introduce, and possibly find a better and smaller one, or even extract some specific feature
into a new micro module.

And of course, the main thing about development is that it should be fun. :)

# Protocols

`src` field is a URI string, that describes path pointing to the specific resource. It supports a few different protocols:

* Built-in:
    * `file://`
    * `http://`
    * `https://`
    * `data://`

* External:
    * `s3://` - [@nexrender/provider-s3](packages/nexrender-provider-s3)
    * `ftp://` - [@nexrender/provider-ftp](packages/nexrender-provider-ftp) - TODO
    * (other procotocols will be added there)

## Examples

```
file:///home/assets/image.jpg
file://d:/projects/project.aep

```

# External Packages

Here you can find a list of packages published by other contributors:

* [somename/package-name](#) - a nice description of a nice package doing nice things

# Plans

1. Add Encoding using ffmpeg `@nexrender/action-encode`
2. Add Uploading to various providers `@nexrender/action-upload`
3. Add an algo of splitting the main job onto sub jobs, rendering them on multiple machines
and then combining back into a single job. `@nexrender/action-merge-parent, @nexrender/action-merge-child`
4. Adding more upload/download providers
5. Add info about providers
6. Add info about differences 0.x vs 1.x
7. Add info about scripting/expressions
8. Add info about asset types
