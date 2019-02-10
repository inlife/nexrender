# Action: Copy

Copy your video/image sequence to a specified folder after rendering is finished

## Installation

If you are using [binary](https://github.com/inlife/nexrender/releases) version of the nexrender,
there is no need to install the module, it is **included** in the binary build.

```
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

## Information

* `input` optional argument, path of the file you want to copy, can be either relative or absulte path. Defaults to current job output video file.
* `output` is a path on your system where result will be saved to, can be either relative or absulte path.
