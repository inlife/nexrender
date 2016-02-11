#noxrender
Automates AE project creating and rendering.
Basicaly it takes premade project, creates copy of it, downloads and replaces default assets, and starts rendering process.

>Currently under initial development phase.

### Documentation can be found: [here](DEVELOPMENT.md)

## Dependencies
- Node.js
- Adobe After Effects
- ffmpeg (audio information)

## Installation
* Clone the repo.
* Create output template in Adobe After Effects with name "h264"
* Install ffpmeg:

On OS X using **Homebrew**:

```sh
$ brew install ffmpeg
```
On windows using **Google** :D

* Install dependencies

```sh
$ npm install
```
* Copy configs, and dont forget to **edit** them

```sh
$ cp example.env .env
```
*  Run

```sh
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
