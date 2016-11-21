<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/2182108/13386302/81509736-deb3-11e5-829b-b355edd1325f.png" />
</p>

<p align="center">
<b><a href="#overview">Overview</a></b>
|
<b><a href="#install">Install</a></b>
|
<b><a href="#use">Use</a></b>
|
<b><a href="https://github.com/Inlife/nexrender/wiki">Wiki</a></b>
|
<b><a href="#support">Support</a></b>
</p>

<br>

-------

[![npm version](https://badge.fury.io/js/nexrender.svg)](https://badge.fury.io/js/nexrender)
[![Dependency Status](https://david-dm.org/inlife/nexrender.svg)](https://david-dm.org/inlife/nexrender)
[![Build Status](https://travis-ci.org/Inlife/nexrender.svg?branch=master)](https://travis-ci.org/Inlife/nexrender)
[![Test Coverage](https://codeclimate.com/github/Inlife/nexrender/badges/coverage.svg)](https://codeclimate.com/github/Inlife/nexrender/coverage)
[![Code Climate](https://codeclimate.com/github/Inlife/nexrender/badges/gpa.svg)](https://codeclimate.com/github/Inlife/nexrender)
[![License](http://img.shields.io/:license-MIT-blue.svg)](http://doge.mit-license.org)
[![Discord](https://img.shields.io/badge/discord-inlife-green.svg)](https://discord.gg/S2JtRcB)

-------

Automate your After Effects project creation and rendering routine. Create your own render network.

# Overview
This project solves problem of full video production cycle *(creating, maintaining and releasing)* for Adobe After Effects oriented projects. The aim is to build easy-to-use tool for video content creators to make theirs work easier.

## It allows you to
* create your own **render network (render farm)**.
* create **personalized videos**.
* create **localized videos**.
* create **data driven videos**
* **plan and schedule** creation of video project, it's rendering and publishing.

## How it works
* rendering: It uses Adobe After Effects's **aerender** command-line interface application.
* compositing: It creates temporary folder, copies project and **replaces assets** with provided ones.
* personalization: It uses AE's **expressions** paired with compositing *(noted above)*.
* scheduling: It stores projects in **local database**.
* network: It renders project per machine, and can be used to render **several projects simultaniously**.
* farm: Can be used to render **single project on several machines** via Multi-Machine Sequence.

## Why
>#### Why this project was created.

I was managing youtube channel, where every week i was posting new music mix video. This video contained background image (was changing every new video), audio track (changing, obviously) and some other components that were static. 

I was fuckn tired of creating nearly same videos over and over again, so i looked up online and found that thing: [http://dataclay.com/](http://dataclay.com/). It was cool, but for non-profit oriented project, it was too pricy.

Then, in a few days of thinking, **nexrender** was born :D

## Alternatives
There not so many alternative solutions to **nexrender**. As far i can tell only Datalcay's [Templater](http://dataclay.com/) bot edition includes such features. But, obviously, **nexrender** lacks many powerfull gui/user oriented features that templater have.
Anyways, what **nexrender** do have is a very particular set of skills: 

* it's free
* it's open source
* it does not require you to use gui (you know, cli...automation'n'stuff)
* it does [not require you to have licensed](https://helpx.adobe.com/after-effects/using/automated-rendering-network-rendering.html#network_rendering_with_watch_folders_and_render_engines) Adobe After Effects on every rendering machine


# Install
Install globally to use as **cli**:

```sh
$ npm install nexrender -g
```

Install locally to use programmaticaly, or as **api**:

```sh
$ npm install nexrender
```

# Use
## Update
There is a boilerplate project (kinda demo). It includes a created project ready to render, and all different aspects of nexrender (asset substitution, dynamic data processing, etc.). You can checkout the project here: [https://github.com/inlife/nexrender-boilerplate](https://github.com/inlife/nexrender-boilerplate)

There are 2 main ways to use this tool. First one: to use as a isolated local render node, which will be just renderning projects that you'll want it to. And the second one: to create a render network, which will be pulling registered projects in api-server database, render them, and update their status on that server. `api server + render nodes * N = network (farm)`. See [wiki](https://github.com/Inlife/nexrender/wiki) for details.

# Usage (Simple Example)
Run http server to serve static asset files, for example on port `31999`. Then create 

```js
'use strict';

var Project   = require('nexrender').Project;
var renderer  = require('nexrender').renderer;

var project = new Project({
    'template': 'MyTemplate.aepx',
    'composition': 'MainComp',
    'settings': {
        'outputModule': 'JPEG', // check your AE for existing output module
        'outputExt': 'jpg'
    },
    'assets': [
        {
            'type': 'project',
            'src': 'http://127.0.0.1:31999/MyTemplate.aepx',
            'name': 'MyTemplate.aepx'
        }, {
            'type': 'image',
            'src': 'http://127.0.0.1:31999/HotAirBalloon.png',
            'name': 'HotAirBalloon.png'
        }, {
            'type': 'script',
            'src': 'http://127.0.0.1:31999/test.js',
            'name': 'test.js'
        }
    ]
});

// start rendering
// NOTE: i inserted path to my aerender binary
// if you are on windows, your path might look like:
// 'C:\\Program Files\Adobe\After Effects CC 2015\aerender.exe'
var rendered = renderer.render('/Applications/Adobe After Effects CC 2015.3/aerender', project);

rendered.then(function() {
    // successfully rendered
    console.log('yay!');
});

```
#### **Note:** You need to start local/remote web-server that will be handling asset distribution. Or put assets on other web-server.


## Usage (Render network (farm))
To start [**api server**:](https://github.com/Inlife/nexrender/wiki/API-server)

```sh
$ nexrender --api-server --port=3000
```

To start [**render node**:](https://github.com/Inlife/nexrender/wiki/Rendering-node)

```sh
$ nexrender --renderer --host=localhost:3000 --aerender=/path/to/aerender
```

What you need next, is to POST [project](https://github.com/Inlife/nexrender/wiki/Project-model) data to api server. More info: [https://github.com/Inlife/nexrender/issues/7](https://github.com/Inlife/nexrender/issues/7)

## Usage (Render network + node.js API wrapper)

If you want to manage your projects rendering and render network from a node.js application, you can write an simple extension do make all things cool and nifty.

Creating [**project**:](https://github.com/Inlife/nexrender/wiki/Project-model)

```js
var api = require('nexrender').api;

// Configure api connection
api.config({
    host: "localhost",
    port: 3000
});

// Define project properties
var assets = [{
    type: 'image',
    src: 'https://dl.dropboxusercontent.com/u/28013196/avatar/mario.jpeg',
    name: 'image.jpg'
}];

// Create project
api.create({
    template: 'template1.aepx',
    composition: 'base',
    assets: assets
}).then((project) => {

    console.log('project saved');

    project.on('rendering', function(err, project) {
        console.log('project rendering started');
    });

    project.on('finished', function(err, project) {
        console.log('project rendering finished')
    });

    project.on('failure', function(err, project) {
        console.log('project rendering error')
    });
});
```

____


# Support
For more information, check out [Wiki](https://github.com/Inlife/nexrender/wiki)
<br>
Also you are free to ask me questions -> open an issue.

## Plans
- cover code with tests
- add render progress evaluation
- add security to rest api layer
- add feature of parallel rendering
- test on more configurations

## Contribution
Follow [this link](CONTRIBUTING.md).

## License
The project is licensed under the [MIT license](LICENSE).
