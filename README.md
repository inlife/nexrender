#noxrender
Automates AE project creating and rendering.
Basicaly it takes premade project, creates copy of it, downloads and replaces default assets, and starts rendering process.

>Currently under initial development phase.

## Dependencies
- Node.js
- Adobe After Effects
- ffmpeg (audio information)

## Installation
1. Clone the repo.
2. Create output template in Adobe After Effects with name "h264"
3. Follow instructions:

using **Homebrew**:

```sh
$ brew install ffmpeg
$ npm install
$ cp example.env .env
$ node index.js
```

using **apt-get**:

```sh
$ sudo apt-get install ffmpeg
$ npm install
$ cp example.env .env
$ node index.js
```

## Plans
- Cover code with comments
- Make ffmpeg optional
- Add Youtube upload
- Integrate IFTTT
- Fully functional REST API
- Attach database to store projects
- Conditional/Scheduled project rendering
