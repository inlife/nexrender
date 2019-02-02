<p align="center">
    <img src="https://user-images.githubusercontent.com/2182108/52168707-e299f000-2735-11e9-9f28-5975a39c1d18.png" />
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

## Introduction

`nexrender` is a simple, small, carefully designed application with main goal of rendering automation for Adobe After Effects based rendering workflows.

At this point in time the project is mainly targeted at people at least somewhat comfortable with scripting or development,
and that have basic knowledge of `javascript` language and `json` formats.

#### Features

* data-driven, dynamic, personalized video rendering
* automated video management, processing and delivery
* network oriented project structure, render farm
* highly modular nature, extensive plugin support
* works only in cli mode, never launches After Effects GUI application
* does not require licenses for Adobe After Effects on any worker machine
* free to use and open source

#### How it works

* rendering: It uses Adobe After Effects's aerender command-line interface application.
* compositing: It creates temporary folder, copies project and replaces assets with provided ones.
* personalization: It uses AE's expressions, scripting and compositing (noted above).
* scheduling: It stores projects in local database, managed from anywhere using http api.
* network: It renders project per machine, and can be used to render several projects simultaniously.
* farm: Can be used to render single project on several machines via Multi-Machine Sequence.

#### Alternatives

Probably the closest (feature-wise) alternative that exists at the moment is the Datalcay's [Templater](http://dataclay.com/) bot edition.
Compared to nexrender it has a rich GUI support and a number of enterprise scale features, however it is not free.

## Usage

### Job

TODO: describe the job

### Using binaries

You can download binaries directly from the [releases](https://github.com/inlife/nexrender/releases) section,
or install them using npm, whichever option works better for you.

#### `nexrender-worker`

##### Description:
A CLI application which is responsible mainly for actual job processing and rendering,
communication with the `nexrender-server`, and serves mainly as a consumer in the nexrender network model.

##### Supported platforms:
Windows, macOS

##### Requirements:
Installed licensed/trial version of Adobe After Effects

```sh
$ nexrender-worker \
        --host=https://my.server.com \
        --secret=myapisecret
```

## Plans

1. Encoding using ffmpeg `@nexrender/action-encode`
2. Uploading to various providers `@nexrender/action-upload`
3. Algo of splitting the main job onto subjobs, rendering them on multiple machines
and then combining back into a single job. `@nexrender/action-merge-parent, @nexrender/action-merge-child`
4. Adding more upload/download providers
5. Creating fully-enclosed binary builds containing majority of the @nexrender/* npm modules
