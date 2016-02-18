<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/2182108/13123763/8215afc6-d5c6-11e5-8462-039165c84e2f.png" />
</p>

-------

Automate your After Effects project creation and rendering routine. 

>Create your own render network.

## Purpose
Create application, that can automatically create and render AE projects from templates, and managing rendering queue. It's can be useful for everyone out there, who have constant routine of creating big amount of very similar projects. 

### To understand what its really about
I suggest you to read this [document](DEVELOPMENT.md).

## Features
- asset import
- creating project from template
- automated rendering
- multiple machines support
- persistent database storage
- api library

## Use cases:
- Create own render network (render farm)
- Easy way to queue up projects
- Automate creating similar projects with different assets

## Installation
Install globally to use as **cli**:

```sh
$ npm install nexrender -g
```

Install locally to use programmaticaly, or as **api**:

```sh
$ npm install nexrender
```

## Usage (CLI)
To start **api server**:

```sh
$ nexrender --api-server --port=3000
```

To start **render node**:

```sh
$ nexrender --renderer --host=localhost:3000 --aerender=/path/to/aerender
```

## Usage (API)

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
    template: 'template1.aep',
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

## Plans
- create plugin for youtube uploading
- create plugin for email notifications
- add feature of parallel rendering

## Development
Read document: [here](DEVELOPMENT.md)

## [License] (LICENSE)
