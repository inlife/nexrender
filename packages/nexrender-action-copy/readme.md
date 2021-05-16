# Action: Copy

Copy your video/image sequence to a specified folder after rendering is finished

## Installation

If you are using [binary](https://github.com/inlife/nexrender/releases) version of the nexrender,
there is no need to install the module, it is **included** in the binary build.

```bash
npm i @nexrender/action-copy -g
```

## Usage

When creating your render job provide this module as one of the `postrender` actions:

```js
// job.json
{
    "actions": {
        "postrender": [
            {
                "module": "@nexrender/action-copy",
                "output": "/home/videos/myvideo.mov"
            }
        ]
    }
}
```

Using glob:

```js
// job.json
{
    "actions": {
        "postrender": [
            {
                "module": "@nexrender/action-copy",
                "glob": true,
                "input": "*.png",
                "output": "/home/videos/" // MUST be directory...
            }
        ]
    }
}
```

## Information

* `input` optional argument, path of the file you want to copy, can be either relative, absolute or glob path. Defaults to current job output video file.
* `output` is a path on your system where result will be saved to, can be either relative or absolute path.
