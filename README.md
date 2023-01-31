<p align="center">
    <img src="https://user-images.githubusercontent.com/2182108/60247318-22ba6480-98c9-11e9-8447-1cbb01db15fe.png" />
</p>

<div align="center">
    <a href="https://travis-ci.org/inlife/nexrender"><img src="https://travis-ci.org/inlife/nexrender.svg?branch=master" alt="Build status" /></a>
    <a href="https://github.com/inlife/nexrender/releases"><img src="https://img.shields.io/github/downloads/inlife/nexrender/total?label=release%20downloads"/></a>
    <a href="https://www.npmjs.com/package/@nexrender/core"><img src="https://img.shields.io/npm/dt/@nexrender/core?label=npm%20downloads"/></a>
    <a href="https://discord.gg/S2JtRcB"><img src="https://discordapp.com/api/guilds/354670964400848898/embed.png" alt="Discord server" /></a>
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

# Table of contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Introduction](#introduction)
    - [Features](#features)
    - [How it works](#how-it-works)
    - [Alternatives](#alternatives)
- [Installation](#installation)
- [Usage](#usage)
  - [Job](#job)
    - [Assets](#assets)
    - [Actions](#actions)
    - [Details](#details)
    - [Job States](#job-states)
  - [Programmatic](#programmatic)
    - [Information](#information)
- [Template rendering](#template-rendering)
  - [Footage items](#footage-items)
    - [Fields](#fields)
    - [Example](#example)
    - [Original source](#original-source)
      - [Example](#example-1)
  - [Static assets](#static-assets)
    - [Example:](#example)
  - [Data Assets](#data-assets)
    - [Fields](#fields-1)
    - [Example](#example-2)
  - [Script Asset](#script-asset)
    - [Fields](#fields-2)
    - [Dynamic Parameters](#dynamic-parameters)
    - [Supported Parameter Types](#supported-parameter-types)
    - [Parameter Types examples](#parameter-types-examples)
      - [String](#string)
      - [Number](#number)
      - [Array](#array)
      - [Object](#object)
      - [Null](#null)
      - [Functions](#functions)
        - [Warnings](#warnings)
        - [Self-Invoking Functions Example](#self-invoking-functions-example)
      - [Named Functions](#named-functions)
      - [Anonymous Functions](#anonymous-functions)
      - [Complete functions example](#complete-functions-example)
    - [Examples](#examples)
      - [No dynamic parameters.](#no-dynamic-parameters)
      - [Dynamic variable - Array type parameter](#dynamic-variable---array-type-parameter)
        - [Default Dynamic Variable Keyword Parameter](#default-dynamic-variable-keyword-parameter)
    - [Example JSX Script with defaults:](#example-jsx-script-with-defaults)
    - [Example JSX Script without defaults:](#example-jsx-script-without-defaults)
- [Network rendering](#network-rendering)
  - [Using binaries](#using-binaries)
    - [`nexrender-server`](#nexrender-server)
      - [Description:](#description)
      - [Supported platforms:](#supported-platforms)
      - [Requirements:](#requirements)
      - [Example](#example-3)
    - [`nexrender-worker`](#nexrender-worker)
      - [Description:](#description-1)
      - [Supported platforms:](#supported-platforms-1)
      - [Requirements:](#requirements-1)
      - [Example](#example-4)
  - [Using API](#using-api)
- [Tested with](#tested-with)
- [Additional Information](#additional-information)
  - [Protocols](#protocols)
    - [Examples](#examples-1)
  - [WSL (Windows Subsystem for Linux)](#wsl)
    - [Linux Mapping](#linux-mapping)
    - [Windows Pathing](#windows-pathing)
    - [Binary](#wsl-binary)
    - [Workpath](#wsl-worthpath)
    - [Memory](#wsl-memory)
  - [Problems](#problems)
  - [Development](#development)
  - [Project Values](#project-values)
  - [Awesome External Packages](#awesome-external-packages)
  - [Awesome Related Projects](#awesome-related-projects)
    - [Custom Actions](#custom-actions)
  - [Migrating from v0.x](#migrating-from-v0x)
    - [Naming](#naming)
    - [Structure](#structure)
    - [Assets](#assets-1)
    - [Rendering](#rendering)
    - [CLI](#cli)
  - [Customers](#customers)
  - [Plans](#plans)
  - [Contributors](#contributors)
    - [Code Contributors](#code-contributors)
    - [Financial Contributors](#financial-contributors)
      - [Individuals](#individuals)
      - [Organizations](#organizations)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Introduction

`nexrender` is a simple, small, carefully designed application with the main goal of rendering automation for Adobe After Effects based rendering workflows.

At this point in time, the project is mainly targeted at people at least somewhat comfortable with scripting or development,
and that have basic knowledge of `javascript` language and `json` formats.

### Features

* data-driven, dynamic, personalized video rendering
* automated video management, processing, and delivery
* network-oriented project structure, render farm
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

Probably the closest (feature-wise) alternative that exists at the moment is the Dataclay's [Templater](http://dataclay.com/) bot edition.
Compared to nexrender it has a rich GUI support and a number of enterprise-scale features, however, it is not free.

# Installation

You can download binaries directly from the [releases](https://github.com/inlife/nexrender/releases) section,
or install them using npm, whichever option works better for you.

However, please note: the npm version of the binaries doesn't include all optional `plugin` packages that are covered in the usage section.
If you wish to install them as well, please do so by providing each one individually:

```
npm i -g @nexrender/cli @nexrender/action-copy @nexrender/action-encode ...
```

# Usage

We will be using `nexrender-cli` binary for this example. It's recommended to download/install it if you haven't already.

Also, check out these example/tutorial videos made by our community:
* ["Creating automated music video with nexrender"](https://www.youtube.com/watch?v=E64dXZ_AReQ) by **[douglas prod.](https://www.youtube.com/channel/UCDFTT_oX6VwmANKMng0-NUA)**

>⚠ If using WSL check out [wsl support](#wsl)

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
$ nexrender-cli '{"template":{"src":"file:///home/documents/myproject.aep","composition":"main"}}'
```

> Note: on MacOS you might need to change the permissions for downloaded file, so it would be considered as an executable.  
> You can do it by running: `$ chmod 755 nexrender-cli-macos`

or more conveniently using the `--file` option

```sh
$ nexrender-cli --file myjob.json
```

> Note: its recommended to run `nexrender-cli -h` at least once, to read all useful information about available options.

More info: [@nexrender/cli](packages/nexrender-cli)

### Assets

We've successfully rendered a static project file using nexrender, however, there is not much point doing that unless we
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
            "layerName": "background.png"
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
            "layerName": "background.png"
        }
    ],
    "actions":{
        "postrender": [
            {
                "module": "@nexrender/action-encode",
                "preset": "mp4",
                "output": "encoded.mp4"
            },
            {
                "module": "@nexrender/action-copy",
                "input": "encoded.mp4",
                "output": "d:/mydocuments/results/myresult.mp4"
            }
        ]
    }
}
```

We've just added a `postrender` action, that will occur right after we finished rendering.
A module that we described in this case, is responsible for copying result file from a temp folder to the `output` folder.

There are multiple built-in modules within nexrender ecosystem:

* [@nexrender/action-copy](packages/nexrender-action-copy)
* [@nexrender/action-encode](packages/nexrender-action-encode)
* [@nexrender/action-upload](packages/nexrender-action-upload)
* [@nexrender/action-cache](packages/nexrender-action-cache)
* (list will be expanded)

Every module might have his own set of fields, however, `module` field is always there.

Also, you might've noticed that `actions` is an object, however, we described only one (`postrender`) field in it.
And there are more:
 - `predownload` - can be used to modify the job before the assets are downloaded
 - `postdownload` - can be used to modify the job after the assets are downloaded
 - `prerender` - can be used to process data/assets just before the actual render will start.

Also, if you are planning on having more than one action, please note: **actions are order-sensitive**,
that means if you put let's say some encoding action after upload, the latter one might not be able to find a file that needs to be generated by the former one,
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

Also, you can [checkout packages](#awesome-external-packages) made by other contributors across the network:

### Details

Job structure has more fields, that we haven't checked out yet. The detailed version of the structure looks like this:

```js
{
    "tags": String,
    "priority": Number,
    "template": {
        "src": String,
        "composition": String,

        "frameStart": Number,
        "frameEnd": Number,
        "incrementFrame": Number,

        "continueOnMissing": Boolean,
        "settingsTemplate": String,
        "outputModule": String,
        "outputExt": String,
    },
    "assets": [],
    "actions": {
        "predownload": [],
        "postdownload": [],
        "prerender": [],
        "postrender": [],
    },
    "onChange": Function,
    "onRenderProgress": Function,
    "onRenderError": Function
}
```

Majority of the fields are just proxied to the `aerender` binary, and their descriptions and default
values can be checked [here](https://helpx.adobe.com/after-effects/using/automated-rendering-network-rendering.html).

- `tags` (optional) (example `primary,plugins` : comma delimited ) is a piece of information that describes the job that it is assigned to. It can be used by the worker(s) / or api client(s) to pickup the job with specific tags (see `tagSelector` [here](packages/nexrender-worker) ). Tags name must be an alphanumeric.

- `priority` (default 0) is a number of priority. Jobs are selected based on their priority field by the worker, in case of a collision it will choose the oldest one.

- `onChange` is a [callback](https://github.com/inlife/nexrender/blob/master/packages/nexrender-core/src/helpers/state.js) which will be triggered every time the job state is changed (happens on every task change).

- `onRenderProgress` is a [callback](https://github.com/inlife/nexrender/blob/master/packages/nexrender-core/src/tasks/render.js) which will be triggered every time the rendering progress has changed.

- `onRenderError` is a [callback](https://github.com/inlife/nexrender/blob/master/packages/nexrender-core/src/tasks/render.js) which will be triggered when `arender` encounters an error during its runtime. So far known errors are (please contribute):
  - Errors from [nexrender.jsx](https://github.com/inlife/nexrender/blob/master/packages/nexrender-core/src/assets/nexrender.jsx) - most likely issue in the `assets` section within the job.
  - `No comp was found with the given name.` - Composition from `template.composition` not present in the AE file.
  - `After Effects error: file is damaged.` - AE file is broken and could not be opened (caused by incomplete transfer/download)


Note: Callback functions are only available via programmatic use. For more information, please refer to the source code.

### Job States

> **Note:** Job states are mainly used for network rendering. If you are using `nexrender-cli` you can skip this section.

Job can have state field (`job.state`) be set to one of those values:

 * `created` (default)
 * `queued` (when pushed to the nexrender-server)
 * `picked` (when somebody picked up job on nexrender-server)
 * `started` (when worker started preparing and running the job)
 * `render:setup` (bunch of states that are specific to each render step)
 * `render:predownload`
 * `render:download`
 * `render:postdownload`
 * `render:prerender`
 * `render:script`
 * `render:dorender`
 * `render:postrender`
 * `render:cleanup`
 * `finished` (when worker successfully finished rendering the job)
 * `error` (when worker got an error at any step starting from `started` state)

## Programmatic

In case you are building your own application and just need to use a rendering part, or you wanna manually trigger jobs from your code,
there is a way to use nexrender programmatically:

Install the [@nexrender/core](https://github.com/inlife/nexrender/tree/master/packages/nexrender-core)

```sh
$ npm install @nexrender/core --save
```

And then load it, and run it

```js
const { render } = require('@nexrender/core')

const main = async () => {
    const result = await render(/*myJobJson*/)
}

main().catch(console.error);
```

Or you can go more advanced, and provide some settings as your 2nd argument to the `render` function:

```js
const { render } = require('@nexrender/core')

const main = async () => {
    const result = await render(/*myJobJson*/, {
        workpath: '/Users/myname/.nexrender/',
        binary: '/Users/mynames/Apllications/aerender',
        skipCleanup: true,
        addLicense: false,
        debug: true,
    })
}

main().catch(console.error);
````

### Information

The module returns 2 methods, `init` and `render`. `render` calls `init` internally, if it sees that there were some options provided to `render` as 2nd argument.

First one is responsible for setting up the env, checking if all needed patches for AE are in place,
automatically adding render-only license file for a free usage of Adobe's product (unless disabled), and a few other minor things.

Second one is responsible for mainly job-related operations of the full cycle: downloading, rendering, processing, and uploading.

`init` accepts an object, containing additional options:

* `workpath` - string, manually set path to working directory where project folder will be created, overrides default one in system temp folder
* `binary` - string, manually set path pointing to the aerender(.exe) binary, overrides auto found one
* `debug` - boolean, enables or disables debug mode, false by default
* `skipCleanup` - boolean, providing true will prevent nexrender from removing the temp folder with project (false by default)
* `skipRender` - boolean, providing true will prevent nexrender from running actual rendering, might be useful if you only want to call scripts
* `multiFrames` - boolean, providing true will attmpt to use aerender's built-in feature of multi frame rendering (false by default)
* `multiFramesCPU` - integer between 1-100, the percentage of CPU used by multi frame rendering, if enabled (90 by default)
* `reuse` - boolean, false by default, (from Adobe site): Reuse the currently running instance of After Effects (if found) to perform the render. When an already running instance is used, aerender saves preferences to disk when rendering has completed, but does not quit After Effects. If this argument is not used, aerender starts a new instance of After Effects, even if one is already running. It quits that instance when rendering has completed, and does not save preferences.
* `maxMemoryPercent` - integer, undefined by default, check [original documentation](https://helpx.adobe.com/after-effects/using/automated-rendering-network-rendering.html) for more info
* `imageCachePercent` - integer, undefined by default, check [original documentation](https://helpx.adobe.com/after-effects/using/automated-rendering-network-rendering.html) for more info
* `addLicense` - boolean, providing false will disable ae_render_only_node.txt license file auto-creation (true by default)
* `forceCommandLinePatch` - boolean, providing true will force patch re-installation
* `wslMap` - String, set WSL drive map, check [wsl](#wsl) for more info
* `maxRenderTimeout` - Number, set max render timeout in seconds, will abort rendering if it takes longer than this value (default: 0 - disabled)
* `cache` - boolean or string. Set the cache folder used by HTTP assets. If `true` will use the default path of `${workpath}/http-cache`, if set to a string it will be interpreted as a filesystem path to the cache folder.

More info: [@nexrender/core](packages/nexrender-core)

## Using the ${workPath} mask in @nexrender/action-encode

The output of `@nexrender/action-encode` is always prepended by the working path of the job, so you don't have to guess paths. However if you want to use the working path of the job for something else such as encoding in multiple bitrates it is necessary to use the `${workPath}` mask.
This is especially useful for HLS encoding

```json
//HLS encoding
{
    "module": "@nexrender/action-encode",
    "output": "encoded_playlist_%v.m3u8",
    "params": {
        "-acodec": "aac",
        "-vcodec": "libx264",
        "-pix_fmt": "yuv420p",
        "-map": [
            "0:0",
            "0:0",
            "0:0"
        ],
        "-b:v:0": "2000k",
        "-b:v:1": "1000k",
        "-b:v:2": "500k",
        "-f": "hls",
        "-hls_time": "10",
        "-hls_list_size": "0",
        "-var_stream_map": "v:0,name:high v:1,name:medium v:2,name:low",
        "-master_pl_name": "master.m3u8",
        "-hls_segment_filename": "${workPath}\\encoded%d_%v.ts"
    }
}
```

The `-hls_segment_filename` flag requires the absolute paths or else it would save on the working path of the nexrender application hence the use of `${workPath}`


# Template rendering

One of the main benefits of using nexrender is an ability to render projects using data other than what has been used while the project has been created.
Data means any sort of source/footage material, it can be images, audio tracks, video clips, text strings, values for colors/positions, even dynamic animations using expressions.
All of those things can be replaced for every job without even opening a project file or starting After Effects.

> Note: Also this process can be called in other ways: **templated**, **data-driven** or **dynamic** video generation.

This approach allows you to create a .aep file once, and then reuse it for as many target results as you need to.
However, what is needed to get started?

## Footage items

Footage item replacement is what briefly has been covered in the `Job` section of this document.
The idea is quite simple, you describe which asset will replace existing described footage item in a specific layer,
by specifying `src`, and one of the `layerName` or `layerIndex` options.

### Fields

* `src`: string, a URI pointer to the specific resource, check out [supported protocols](#protocols)
* `type`: string, for footage items, is one of (`image`, `audio`, `video`)
* `layerName`: string, target layer name in the After Effects project
* `layerIndex`: integer, can be used instead of `layerName` to select a layer by providing an index, starting from 1 (default behavior of AE jsx scripting env)
* `composition`: string, composition where the layer is. Useful for searching layer in specific compositions. If none is provided, it uses the wildcard composition "\*",
that will result in a wildcard composition matching, and will apply this data to every matching layer in every matching composition. If you want to search in a nested composition you can provide a path to that composition using  `"->"` delimiter.  
For example, `"FULL_HD->intro->logo comp"` matches a composition named `logo comp` that is used in composition `intro` which in turn is used in composition `FULL_HD`. Note, that `FULL_HD` doesn't have to be the root composition. Make sure to specify a **composition** name, not a layer name.
* `name`: string, an optional filename that the asset will be saved as. If not provided the `layerName` or the basename of the file will be used
* `extension`: string, an optional extension to be added to the filename before it is sent for rendering. This is because After Effects expects the file extension to match the content type of the file. If none is provided, the filename will be unchanged.
* `useOriginal`: boolean, an optional feature specific to the `file://` protocol that prevents nexrender from copying an asset to a local temp folder, and use original instead

The specified asset from `src` field will be downloaded/copied to the working directory, and just before rendering will happen,
a footage item with specified `layerName` or `layerIndex` in the original project will be replaced with the freshly downloaded asset.

This way you (if you are using network rendering) can not only deliver assets to the target platform but also dynamically replace them.

>Note: if `layerName` is used for footage file asset, it should always contain the extension in the name as well.

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
            "src": "https://example.com/assets/jpeg-without-extension",
            "type": "image",
            "layerName": "MyOtherNicePicture.jpg",
            "extension": "jpg"
        },
        {
            "src": "file:///home/assets/audio.mp3",
            "type": "audio",
            "name": "music.mp3",
            "layerIndex": 15
        }
    ]
}
```

### HTTP caching
When using the `http` or `https` protocol, you can utilize local caching to minimize the amount of data that have to be transferred over a network and speed up project/assets download. To use HTTP caching, the server serving your assets must support the relevant [HTTP caching semantics](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching).

The simplest way to enable caching is to use the setting wide cache option (setting`--cache` flag if using CLI or worker CLI, setting `cache: true` when using programmatically). This will enable HTTP based caching for all your assets and project files if they are requested over HTTP from a server that supports the relevant headers.

You can also control caching on a more granular level if desired. For each asset's setting if a `params` property is set, it will be passed directly to [make-fetch-happen](https://github.com/npm/make-fetch-happen) which includes the `cachePath` property that you can set to a custom folder path (or null if you want to disable caching for a particular asset only).

> Note: caches are not cleared automatically so you may need to monitor the cache folder size if you are using a lot of large assets over time. Assets, if they have been cached, will always resolve even if they are stale and the server is not available.

### Example
```json
{
    "assets": [
        {
            "src": "https://example.com/assets/image.jpg",
            "type": "image",
            "layerName": "MyNicePicture.jpg",
            "params": {
                "cachePath": "/tmp/my-nexrender-cache"
            }
        },
        {
            "src": "https://example.com/assets/jpeg-without-extension",
            "type": "image",
            "layerName": "MyOtherNicePicture.jpg",
            "extension": "jpg",
            "params": {
                "cachePath": "/tmp/my-nexrender-cache"
            }
        }
    ]
}
```

### Original source

For `file` protocol based assets (assets coming from the local filesystem/shared network), you can provide an additional option, `useOriginal`, that would force nexrender to use an original file
rather than creating a local copy inside of the temp rendering folder. That could be useful for large asset files, that would otherwise take a long time to copy.

#### Example

```json
{
    "assets": [
        {
            "src": "file:///D:/assets/MyBigAsset.wav",
            "type": "audio",
            "useOriginal": true,
            "layerIndex": 15
        }
    ]
}
```

## Static assets

There is also a plain asset type that allows you to simply provide a `src`, and that file will be downloaded in the folder with the project.
No additional automated actions will happen with that asset, unless you manually use scripting to do something with those.
Might be useful for some static data-based injections, or some other use cases.

### Example:

```json
{
    "assets": [
        {
            "src": "http://example.com/assets/something.json",
            "type": "static"
        },
        {
            "src": "http://example.com/assets/something_else.csv",
            "name": "mydata.csv",
            "type": "static"
        }
    ]
}
```

## Data Assets

The second important point for the dynamic data-driven video generation is the ability to replace/change/modify non-footage data in the project.
To do that, a special asset of type `data` can be used.

### Fields

* `type`: string, for data items, is always `data`
* `layerName`: string, target layer name in the After Effects project
* `layerIndex`: integer, can be used instead of `layerName` to select a layer by providing an index, starting from 1 (default behavior of AE jsx scripting env)
* `property`: string, indicates which layer property you want to change
* `value`: mixed, optional, indicates which value you want to be set to a specified property
* `expression`: string, optional, allows you to specify an expression that can be executed every frame to calculate the value
* `composition`: string, composition where the layer is, useful for searching layer in specific compositions. If none is provided, it uses the wildcard composition "\*",
that will result in a wildcard composition matching, and will apply this data to every matching layer in every matching composition. If you want to search in a nested composition you can provide a path to that composition using  `"->"` delimiter.  
For example, `"FULL_HD->intro->logo comp"` matches a composition named `logo comp` that is used in composition `intro` which in turn is used in composition `FULL_HD`. Note, that `FULL_HD` doesn't have to be the root composition. Make sure to specify a **composition** name, not a layer name.
* `continueOnMissing`: boolean (default false), optional, allows you to bypass an error exception if couldn't find any layers. Probably should not be used by users, unless they know what are they doing.

Since both `value` and `expression` are optional, you can provide them in any combination, depending on the effect you want to achieve.
Providing `value` will set the exact value for the property right after execution, and providing an expression will make sure it will be evaluated every frame.

>Note: If you are not sure what expressions are, and how to use them, please refer [to this page](https://helpx.adobe.com/after-effects/using/expression-basics.html)

And if you are not sure what a `property` is or where to get it, you can refer to this image:

<details>
<summary><b>Property Example</b></summary>

>As you can see there are a few `Property Groups` like Text, Masks, Transform that include actual properties. Those properties are what can be used as a target.

![](https://user-images.githubusercontent.com/2182108/52443468-7270dd00-2b2e-11e9-8336-255349279c43.png)

In case you need to change some **deep properties**, as shown on this image...

![](https://user-images.githubusercontent.com/7440211/59557356-6fa45e00-8fe0-11e9-84d4-f4e8152f2913.png)

... you can do that by providing the property name using a dot `.` separator (e.g. "Effects.Skin_Color.Color").
In case your property already has `.` in the name, and you are sure it will lead to a collision while parsing, you can instead use an arrow symbol `->`.

You can also change the deeper attributes of properties, for example the font of a text layer, using "Source Text.font" or the font size by "Source Text.fontSize".
</details>

### Example

```json
{
    "assets": [
        {
            "type": "data",
            "layerName": "MyNicePicture.jpg",
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
            "layerName": "my text field",
            "property": "Source Text.font",
            "value": "Arial-BoldItalicMT"
        },
        {
            "type": "data",
            "layerName": "background",
            "property": "Effects.Skin_Color.Color",
            "value": [1, 0, 0]
        },
        {
            "type": "data",
            "layerIndex": 15,
            "property": "Scale",
            "expression": "[time * 0.1, time * 0.1]"
        },
    ]
}
```

>Note: any error in expression will prevent the project from rendering. Make sure to read error messages reported by After Effects binary carefully.

## Script Asset

🚀 **NEW**: Now you can pass arguments to JSX dynamically! Read below for more information 🚀

The last and the most complex and yet the most powerful is an ability to execute custom `jsx` scripts just before the rendering will start.
This approach allows you to do pretty much anything that is allowed for scripting,
like creating/removing layers, adding new elements, restructuring the whole composition, and much more.

With some basic knowledge of `ExtendScript Toolkit`, you can write custom scripts that nexrender will pass through to the underlying CLI (or render network) to execute before rendering. You'll just need to provide a `src` pointing towards the script resource and a `type` of `"script"`.

### Fields

* `src`:                        **string**, a URI pointer to the specific resource, check out [supported protocols](#protocols)
* `type`:                       **string**, for script items, is always `script`
* `keyword`:                    (optional) **string**, name for the configuration object holding all the dynamically injected parameters. Defaults to **NX**
* `parameters`:                 (optional) **object**, object where all the dynamically injected parameters are defined. Script variables that are not included in this list default to `null`.
* `globalDefaultValue`          (optional) **any**, An override for the default value of any unknown or undefined **NX** (or the `keyword` value, if set) config values. Use caution  when overriding defaults like this. It is suggested to leave it as is and check for `null` values in your JSX code.

### Dynamic Parameters

With dynamic parameters, you can set a parameter in your Job declaration to be used on a JSX Script! 

Each parameter object must have the following:
* **key** (required)    :   The key of the variable. Example: Key = dog => NX.dog.
* **value** (required)  :   The target value for the variable. Example: Key = dog, Value = "doggo" => NX.dog = "doggo". See [Supported Parameter Types](#supported-parameter-types). 

### Supported Parameter Types

We currently support all standard [JSON Parameters](https://restfulapi.net/json-data-types/) with the addition of javascript **[functions](#functions)**, which can be named, anonymous or self-invoking.

* [`string`](#string)
* [`number`](#number)
* [`array`](#array)
* [`object`](#object)
* [`null`](#null) __(default)__
* [`functions`](#functions)

### Parameter Types examples

#### String
```json
    "parameters" : [
        {
            "key" : "fullName",
            "value": "John Doe"
        }
    ]
```

#### Number
```json
    "parameters" : [
        {
            "key" : "orangeAmount",
            "value": 37
        }
    ]
```

#### Array
```json
    "parameters" : [
        {
            "key" : "officesList",
            "value": ["Santiago", "London", "Paris", "Kyoto", "Hong-Kong"]
        }
    ]
```

#### Object
```json
    "parameters" : [
        {
            "key" : "carDetails",
            "value": {
                "model" : "Tesla Model S",
                "maxBatteryLife" : 500000,
                "color" : "vermilion"
            }
        }
    ]
```

#### Null

This is the default value for parameters used on any given JSX script that are not initializated.

```json
    "parameters" : [
        {
            "key" : "carDetails"
        }
    ]
```
`NX.get("carDetails")` will be equal to `null`. 



#### Functions

Functions are useful if you need some dynamic calculation of specific values. You can use them in conjuction with other dynamic parameters as well. Currently we support [Self-invoking Functions](#self-invoking-functions-example), [Named Functions](#named-functions-example) and [Anonymous Functions](#anonymous-functions-example). After Effects ExtendedScript **does not support arrow functions** at the moment (cc 2020).

##### Warnings
* You must **only use one function per parameter**; If there's more than one function defined in the parameter `value` the job will crash due to limitations in function detection and parsing. 
* Use well-formed functions and be aware of the computational weight of your functions. Malformed functions will cause the script to fail and subsequently the job to crash.

##### Self-Invoking Functions Example
Self-invoking functions are useful when concatenating strings, or in places where you want the function output without redeclaring it. 

```json
    "parameters" : [
        {
            "key" : "onePlusOne",
            "value": "(function() { return 1+1; })()"
        }
    ]
```
The above function could be use in a string concatenation such as 

```jsx
    alert("Miss, what's the mathematical operation required to compute the number" + NX.get("onePlusOne") + " ?"); // A typical second grade question.
```

```json
    "parameters" : [
        {
            "key" : "invitees",
            "value": ["Steve", "Natasha", "Tony", "Bruce", "Wanda", "Thor", "Peter", "Clint" ]
        },
        {
            "key" : "eventInvitation",
            "value": "(function (venue) { alert( 'This years\' Avengers Gala is on the prestigious ' + venue.name + ' located at ' + venue.location + '. Our special guests ' + NX.get('invitees').value.map(function (a, i) { return (i == NX.get('invitees').value.length - 1) ? ' and ' + a + ' (whoever that is)' : a + ', '; }).join('') + '  going to be present for the ceremony!');
    })({ name: NX.arg('venue'), location: NX.arg('location') })",
            "arguments": [
                {
                    "key" : "venue",
                    "value" : "Smithsonian Museum of Natural History"
                },
                {
                    "key" : "location",
                    "value": "10th St. & Constitution Ave."
                }
            ]
        }
    ]
```


This convoluted function would return a lovely invitation string to an event using a dynamic parameter set on the `json` Job, as well as having additional required parameters with their defaults and could be used as follows:

```jsx

    alert(NX.get("eventInvitation"));

    // Output:

    /*
        This years' Avengers Gala is on the prestigious Smithsonian Museum of Natural History located at 10th St. & Constitution Ave. Our special guests Steve, Natasha,Tony, Wanda, Thor, Peter and Clint (whoever that is) are going to be present for the ceremony! 
    */
```

#### Named Functions
```json
    "parameters" : [
        {
            "key" : "sum",
            "value": "function namedSumFunction(a, b) { return a + b; }"
        }
    ]
```

```jsx
    var result = NX.call("sum", [400, 20]); // 420
```

Note that the usage of the named method is `sum` and not `namedSumFunction` due to JS' __hoisting__, so named functions are implemented and used the same way as anonymous functions.

#### Anonymous Functions
```json
    "parameters" : [
        {
            "key" : "sumValues",
            "value": "function (a, b) { return a + b; }"
        }
    ]
```
```jsx
    var result = NX.call("sumValues", [400, 20]); // 420
```

#### Complete functions example
```json
{
    "template": {
        "src": "file:///template.aep",
        "composition": "BLANK_COMP"
    },
    "assets": [
        {
            "src": "file:///sampleParamInjection.jsx",
            "type": "script",
            "parameters": [
                {
                    "type": "array",
                    "key" : "dogs",
                    "value": [ "Captain Sparkles", "Summer", "Neptune"]
                },
                {
                    "type" : "number",
                    "key" : "anAmount"
                },
                {
                    "type": "function",
                    "key": "getDogsCount",
                    "value" : "function() { return NX.get('dogs').length; }"
                },
                {
                    "type": "function",
                    "key": "exampleFn",
                    "value": "function ( parameter ) { return parameter; }"
                },
                {
                    "type" : "function",
                    "key" : "dogCount",
                    "value" : "(function(length) { return length })(NX.arg('dogCount'))",
                    "arguments": [
                        {
                            "key" : "dogCount",
                            "value": ["NX.call('exampleFn', [NX.call('getDogsCount') + NX.get('anAmount')])"]
                        }
                    ]
                }
            ]
        }
    ]
}
```

### Examples

#### No dynamic parameters.

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

#### Dynamic variable - Array type parameter

```json
"assets": [
    {
        "src": "file:///C:/sample/sampleParamInjection.jsx",
        "type": "script",
        "parameters": [
            {
                "key": "name",
                "value": "Dilip"
            }
        ]
    }
]
```

##### Default Dynamic Variable Keyword Parameter

The `value` could be a variable or a function, but beware that there is no sanitization nor validation so **if the input is malformed it could crash the job**

By default the **keyword** is set to **`NX`**, so you would call your variables or methods like `NX.get("foo")` or `NX.call("bar", ["sampleStringParameter"])`. To change this keyword simply set `"keyword"` as shown below:

```json
"assets": [
    {
        "src": "file:///C:/sample/sampleParamInjection.jsx",
        "type": "script",
        "keyword": "_settings",
        "parameters": [
            {
                "key": "name",
                "value": "Dilip"
            }
        ]
    }
]
```

This way instead of `NX.get("foo")` it would be `_settings.get("foo")`

**_All dynamic parameters used in the script should have a JSX default_**

### Example JSX Script with defaults:

```jsx
{
    return "Hello " + NX.get("name") || "John";
}
```

The code above will output either:
1. `"Hello John"` if no parameter defined on the JSON `parameters` array or this parameter is missing.
2. `"Hello NAME"` if parameter `name` has a `value` of `NAME` on the JSON `parameters` array.

### Example JSX Script without defaults:

```jsx
{
    // The code below will crash if it's executed directly in After Effects. See documentation on how to enable cross environment fault tolerance.
    return "There are " + NX.get("beerBottlesAmount") + " beer bottles ready to drink!"
}
```

The code above will output either:
1. `"There are null beer bottles ready to drink!" `if no parameter defined on the JSON `parameters` array.
2. `"There are 20 beer bottles ready to drink!"` if parameter `beerBottlesAmount` has a `value` of `20` on the JSON `parameters` array.

But don't you worry about missing any of the examples above. If you use a variable in your JSX with the default keyword and no initialization whatsoever,
the console will output a handy initialization code snippet for both JSON and JSX for you to copy and modify with your own values!

That pretty much covers basics of templated rendering.

# Network rendering

We've covered basics on how to set up a minimal rendering flow using local cli machine rendering.
Now, what if you want to start rendering on a remote machine, to reduce load while you are working on your local machine?
Or maybe you need to render several videos at once, requiring a fleet of nodes running on some cloud cluster.

![](https://user-images.githubusercontent.com/2182108/77616726-02443700-6f3b-11ea-8e27-b59656d9efe1.png)

With nexrender, you can quickly and easily spin up your own rendering cluster.

## Using binaries

You can download compiled versions of binaries directly from the [releases](https://github.com/inlife/nexrender/releases) section,
or install them using npm, whichever option works better for you.

### `nexrender-server`

#### Description:
A CLI application which is responsible for job management, worker node cooperation,
communications with the `nexrender-worker` instances, serves mainly as a producer in the nexrender network model.

Technically speaking, its a very tiny HTTP server with minimal REST API support.

Optional support for external databases can be added (like Redis, MongoDB, MySQL, etc.), with some of them already in place. Please check modules for more info.

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
There are 2 main ways to do that. You can send a direct POST request:

```sh
curl \
    --request POST \
    --header "nexrender-secret: myapisecret" \
    --header "content-type: application/json" \
    --data '{"template":{"src":"http://my.server.com/assets/project.aep","composition":"main"}}' \
    http://my.server.com:3050/api/v1/jobs
```

Or you can use the javascript API client:

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
    result.on('progress', (job, percents) => console.log('project is at: ' + percents + '%'))
    result.on('finished', job => console.log('project rendering finished'))
    result.on('error', err => console.log('project rendering error', err))
}

main().catch(console.error);
```

More info: [@nexrender/api](packages/nexrender-api)

# Tested with

Current software was successfully tested on:

* Adobe After Effects CS 5.5 [OS X 10.14.2]
* Adobe After Effects CC (version 12.1.168) [OS X 10.11.2, Windows 10 64bit]
* Adobe After Effects CC 2015 (version 13.6.0) [OS X 10.11.2]
* Adobe After Effects CC 2018.3 [Windows 2012 Server R2 Datacenter]
* Adobe After Effects CC 2019 [OS X 10.14.2, Windows Server 2019 (AWS)]

# Additional Information

## Protocols

`src` field is a URI string, that describes path pointing to the specific resource. It supports a few different protocols:

* Built-in:
    * `file://` - file on a local file system, may include environment variables identified by a preceding $ sign (possibly a pipe? need testing)
    * `http://` - file on remote http server
    * `https://` - file on remote http server served via https
    * `data://` - URI encoded data, can be a [base64 or plain text](https://en.wikipedia.org/wiki/Data_URI_scheme)

* External:
    * `gs://` - [@nexrender/provider-gs](packages/nexrender-provider-gs) - Google Cloud Storage provider
    * `s3://` - [@nexrender/provider-s3](packages/nexrender-provider-s3) - Amazon S3 provider
    * `ftp://` - [@nexrender/provider-ftp](packages/nexrender-provider-ftp) - Node.js FTP provider
    * (other protocols will be added there)

### Examples

Here are some examples of src paths:

```
file:///home/assets/image.jpg
file:///d:/projects/project.aep
file://$ENVIRONMENT_VARIABLE/image.jpg

http://somehost.com:8080/assets/image.jpg?key=foobar
https://123.123.123.123/video.mp4

data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==
data:text/plain;charset=UTF-8,some%20data:1234,5678
```

## WSL

If running WSL (`Windows Subsystem for Linux`) you will need to configure your project a bit differently in order for it to render correctly.

### Linux Mapping

You will need to pass in which drive letter `Linux` is mapped to in `Windows`. This is the `Drive Letter` in which you can access your Linux file system from Windows.  

> ⚠ Note: Drive mapping is setup when configuring WSL
You can do this through the CLI like so assuming Linux is mapped to `Z`.


```sh
$ nexrender-cli -f mywsljob.json -m "Z"
```

or

```sh
$ nexrender-cli -f mywsljob.json -wsl-map "Z"
```

And you can do this Programmatically like

```js
const { render } = require('@nexrender/core')
const main = async () => {
    const result = await render(/*myWSLJobJson*/, {
        skipCleanup: true,
        addLicense: false,
        debug: true,
        wslMap: "Z"
    })
}
main().catch(console.error);
````

### Windows Pathing

When referencing windows file system you will need to use `/mnt/[DRIVE YOU WANT TO ACCESS]/[PATH TO YOUR FILE]`.

like so
```
/mnt/d/Downloads/nexrender-boilerplate-master/assets/nm.png
```

CLI Example

```sh
nexrender-cli -f mywsljob.json -m "Z" -w /mnt/d/Downloads/tmp/nexrender
```

Job Example

```json
{
    "template": {
        "src": "file:///mnt/d/Downloads/nexrender-boilerplate-master/assets/nm05ae12.aepx",
        "composition": "main",
    },
    "assets": [
        {
            "src": "file:///mnt/d/Downloads/nexrender-boilerplate-master/assets/2016-aug-deep.jpg",
            "type": "image",
            "layerName": "background.jpg"
        }
    ],
    "actions": {
        "postrender": [
            {
                "module": "@nexrender/action-encode",
                "output": "output.mp4",
                "preset": "mp4"
            }
        ]
    }
}
```

> ⚠ Note: nexrender does not currently support custom root pathing
### WSL Binary

If `After Effects` is installed into the default location `nexrender` should auto detected it. Otherwise you will need to provide its location following the [Windows Pathing Guide](#windows-pathing).

Example for if you installed `After Effect` onto your `D drive`.

```sh
nexrender-cli -f mywsljob.json -b "/mnt/d/Program Files/Adobe/Adobe After Effects 2020/Support Files/aerender.exe"
```

### WSL Workpath

By default nexrender will use your Linux /tmp folder to render out the jobs. 

We suggest changing this to a secondary drive as rendering can eat up disk space causing an issue where `WSL` does no release disk space back to `Windows`.

Example under [Windows Pathing Guide](#windows-pathing).

> Github Issue: [WSL 2 should automatically release disk space back to the host OS
](https://github.com/microsoft/WSL/issues/4699#issuecomment-656352632)
### WSL Memory

It's also suggested that you create a `.wslconfig` file in your `Windows user folder` and limit the memory that can be used by `WSL`. Otherwise your rendering will crash on large projects.

.wslconfig Example
```
[wsl2]
memory=4GB
swap=0
localhostForwarding=true
```

> Github Issue: [WSL 2 consumes massive amounts of RAM and doesn't return it](https://github.com/microsoft/WSL/issues/4166)

## Problems

There might be a lot of problems creeping around, since this tool works as an intermediary and coordinator for a bunch of existing complex technologies, problems is something inescapable. However, we will try our best to expand and keep this section up to date with all possible caveats and solutions for those problems.

1. macOS access: there might be issues with nexrender accessing the aerender binary within the Adobe library folder, or accessing /tmp folders. For more details refer to https://github.com/inlife/nexrender/issues/534

## Development

If you wish to contribute by taking an active part in development, you might need this basic tutorial on how to get started:

1. clone the repo
2. run `npm install`
3. run `npm start`

The last command will run [lerna](https://lerna.js.org/) bootstrap action to setup dependencies for all packages listed in the `packages/` folder,
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

## Project Values

This project has a few principle-based goals that guide its development:

* **Do our thing really well.** Our thing is data-based automating of the rendering, and handling other interactive related components of that task set. It is not meant to be a replacement for specific corporate tools templater bot, rendergarden, etc. that have lots of features and customizability. (Some customizability is OK, but not to the extent that it becomes overly complicated or error-prone.)

* **Limit dependencies.** Keep the packages lightweight.

* **Pure nodejs.** This means no native module or other external/system dependencies. This package should be able to stand on its own and cross-compile easily to any platform -- and that includes its library dependencies.

* **Idiomatic nodejs.** Keep modules small, minimal exported names, promise based async handling.

* **Be elegant.** This package should be elegant to use and its code should be elegant when reading and testing. If it doesn't feel good, fix it up.

* **Well-documented.** Use comments prudently; explain why non-obvious code is necessary (and use tests to enforce it). Keep the docs updated, and have examples where helpful.

* **Keep it efficient.** This often means keep it simple. Fast code is valuable.

* **Consensus.** Contributions should ideally be approved by multiple reviewers before being merged. Generally, avoid merging multi-chunk changes that do not go through at least one or two iterations/reviews. Except for trivial changes, PRs are seldom ready to merge right away.

* **Have fun contributing.** Coding is awesome!

## Awesome External Packages

Here you can find a list of packages published by other contributors:

* [HarryLafranc/nexrender-action-handbrake](https://github.com/HarryLafranc/nexrender-action-handbrake) - Encode a video with Handbrake on nexrender-postrender
* [dberget/nexrender-action-cloudinary](https://github.com/dberget/nexrender-action-cloudinary) - Upload a video to Cloudinary platform
* [dberget/nexrender-action-normalize-color](https://github.com/dberget/nexrender-action-normalize-color) - Normalize colors for each asset defined in options
* [dylangarcia/nexrender-action-unzip](https://github.com/dylangarcia/nexrender-action-unzip) - Unzip composition source before starting to render
* [pilskalns/nexrender-action-template-unzip](https://github.com/Pilskalns/nexrender-action-template-unzip) - Unzip template and find (first) `.aep` file within it. Minimal config.
* [oreporan/nexrender-action-upload-s3-presigned](https://github.com/oreporan/nexrender-action-upload-s3-presigned) - A postrender upload plugin which uploads using https (for s3 presigned_url)
* [pulsedemon/nexrender-action-run-command](https://github.com/pulsedemon/nexrender-action-run-command) - Run shell commands as a nexrender action
* [oksr/nexrender-action-slack-message](https://github.com/oksr/nexrender-action-slack-message) - Utility module for sending a Slack message when render start/finish or render error.
* [vonstring/nexrender-action-mogrt-template](https://github.com/vonstring/nexrender-action-mogrt-template) - Added .mogrt support to Nexrender
* [somename/package-name](#) - a nice description of a nice package doing nice things

Since nexrender allows to use external packages installed globally from npm, its quite easy to add your own modules

## Awesome Related Projects

* [Jeewes/nerc](https://github.com/Jeewes/nerc) - NERC: Tool for filling nexrender config templates with CSV data.
* [newflight-co/createvid](https://github.com/newflight-co/createvid) - A fully functional, full-stack web app built in Vue. Actively looking for community support.

### Custom Actions

To add a custom pre- or post-render action, all you need to do is to create at least a single file, that is going to return a function with promise.

```js
// mymodule.js
module.exports = (job, settings, action, type) => {
    console.log('hello from my module: ' + action.module);
    return Promise.resolve();
}
```

To use that action locally you can then require it by either using relative or global path.
Additionally you can create a private npm module and link it, so it would become visible globally or even publish it to npm/your own private repo and use it.

```json
// example 1
{
    "module": "d:/myprojects/mymodule/index.js",
    "somearg1": "hello world",
    "somearg2": 123456
}
```

```json
// example 2
{
    "module": "my-super-cool-module",
    "somearg1": "hello world",
    "somearg2": 123456
}
```

```json
// example 3
{
    "module": "@myorg/mymodule",
    "somearg1": "hello world",
    "somearg2": 123456
}
```
From there you can build pretty much any module that could process downloaded data before starting rendering,
or doing tranformations on data after, or just simply sending an email when rendering is finished.

>Note: both `job` and `settings` are mutable structures, any modifications made to them will reflect onto the flow of the next calls.
Hence they can be used to store state between actions.

## Migrating from v0.x

First version of nexrender was published in 2016, and it has been used by many people for quite some time since then.
Even though version v1.x is based on the same concepts, it introduces major breaking changes that are incompatible with older version.

However, majority of those changes were made to allow new, previously unimaginable things.

<details>

### Naming

1. Nexrender Project -> Nexrender Job
2. Nexrender Rendernode -> Nexrender Worker
2. Nexrender API Server -> Nexrender Server

Referring to project was confusing since it could be applied for both aep project and nexrender project.
And rendernode name was quite too long, and unconvinient to use.

### Structure

The structure of the job has changed, majority of the fields were moved from the root namespace, into "template" namespace, merging it with old "project.settings" namespace.
Assets structure remained pretty much similar. A new object actions has been introduced.

### Assets

Replaced http and file only assets to a URI based links, theoretically extendable without any limits.
Many new other protocols and implementations can be added in a decentrilized manner.

Strict division between asset types:
* [image, audio, video] - footage items, behave like files
* [data] - dynamic data assets, for direct value setting and expressions
* [script] - files allowing full scripting limitless scripting support

### Rendering

The biggest change that happened, is removal of old hacky way of replacing assets and patching aepx file to write custom expressions.

Instead it has been replaced with brand new, recently discovered ExtendScript based injection.
It allows to do a few quite important things:

1. Import and replace footage items via scripting, making it very reliable. (No more bugs related to same-system existing path override for aep project)
2. Set/Replace text, expressins and other types of data via scripting. (No more bugs related to changes in aepx structure, and no need to use aepx format at all)
3. Ability to run custom ExtendScript jsx scripts, which is limitless and revolutionary compared to previous version.

### CLI

Project has been devided onto multiple subprojects, and mutiple cli applications as a result.
Every cli application is auto-compiled to a platform specific executable on publish and auto-uploaded to the releases section.

This allows anyone to use nexrender cli without installing a nodejs runtime onto target system.

New CLI tool allows to run render directly from console for a local job, without need to start whole cluster.

Worker, and CLI apps include minor QoL improvments, such as auto creation of the ae_render_only_node.txt file that allows free licensing,
and After Effects folder auto detection.

All tools include better help screen, and a lot of customization from command line arguments.

</details>

## Customers

Technically, since the tool is free, customers should be called users.
In any case this section describes a list of users or companies that are proud users of nexrender.
If you've used nexrender, and you like it, please feel free to add yourself into the list.

* [Noxcaos Music](https://www.youtube.com/channel/UC2D9WSUKnyTX8wWqNVITTAw)
* [Two Bit Circus](https://twobitcircus.com)
* [Flügerl](https://www.youtube.com/fluegerl)
* [NewFlight](https://newflight.co)
* [den frie vilje](https://denfrievilje.dk)
* [DR (Danish National Broadcaster)](https://dr.dk)
* you name goes here

## Plans

Features for next major release (`v2.0.0`):
1. Ability to switch renderers for a job (`none`, `aerender`, `media-encoder`)
2. Ability to push a job onto a server with ability to auto-split and render parts independently on the network
  1. API for tracking/managing active workers in the network
  2. Algo of splitting based on time & amount of workers
  3. New job type (`partitioned`), which would be excluded from some general API responses
  4. Mechanism of selecting a single node to be the "finisher", that would await and merge results of other jobs
  5. Possible names: `@nexrender/action-merge-parent, @nexrender/action-merge-child`
3. Extend current scripting capabilities with an advanced real-time communication with the internal environment via TCP connection
4. Define a general abstract inteface for the actions, and a general package that would contain basic funcitonality like input/output arguments, etc.
5. Re-design networking layer, as well as server database layer, to count in cases where the jobs can be huge json objects.
6. Create automated footage detection and asset generator

## Contributors

### Code Contributors

This project exists thanks to all the people who contribute. [[Contribute](CONTRIBUTING.md)].
<a href="https://github.com/inlife/nexrender/graphs/contributors"><img src="https://opencollective.com/nexrender/contributors.svg?width=890&button=false" /></a>

### Financial Contributors

Become a financial contributor and help us sustain our community. [[Contribute](https://opencollective.com/nexrender/contribute)]

#### Individuals

<a href="https://opencollective.com/nexrender"><img src="https://opencollective.com/nexrender/individuals.svg?width=890"></a>

#### Organizations

Support this project with your organization. Your logo will show up here with a link to your website. [[Contribute](https://opencollective.com/nexrender/contribute)]

<a href="https://opencollective.com/nexrender/organization/0/website"><img src="https://opencollective.com/nexrender/organization/0/avatar.svg"></a>
<a href="https://opencollective.com/nexrender/organization/1/website"><img src="https://opencollective.com/nexrender/organization/1/avatar.svg"></a>
<a href="https://opencollective.com/nexrender/organization/2/website"><img src="https://opencollective.com/nexrender/organization/2/avatar.svg"></a>
<a href="https://opencollective.com/nexrender/organization/3/website"><img src="https://opencollective.com/nexrender/organization/3/avatar.svg"></a>
<a href="https://opencollective.com/nexrender/organization/4/website"><img src="https://opencollective.com/nexrender/organization/4/avatar.svg"></a>
<a href="https://opencollective.com/nexrender/organization/5/website"><img src="https://opencollective.com/nexrender/organization/5/avatar.svg"></a>
<a href="https://opencollective.com/nexrender/organization/6/website"><img src="https://opencollective.com/nexrender/organization/6/avatar.svg"></a>
<a href="https://opencollective.com/nexrender/organization/7/website"><img src="https://opencollective.com/nexrender/organization/7/avatar.svg"></a>
<a href="https://opencollective.com/nexrender/organization/8/website"><img src="https://opencollective.com/nexrender/organization/8/avatar.svg"></a>
<a href="https://opencollective.com/nexrender/organization/9/website"><img src="https://opencollective.com/nexrender/organization/9/avatar.svg"></a>
