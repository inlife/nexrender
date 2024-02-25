# Action: Copy

Copy your video/image sequence to a specified folder after rendering is finished

## Installation

If you are using [binary](https://github.com/inlife/nexrender/releases) version of the nexrender,
there is no need to install the module, it is **included** in the binary build.

```
npm i @nexrender/action-copy -g
```

## Usage

If the provided `output` path does not exist, it will be created automatically. If the file already exists, it will be overwritten.

If the `output` path is a folder, the output file will be saved in the destination folder with the default name, example: `result.mp4`. If the `useJobId` is set to `true`, the output file will be saved in the destination folder with the job id used as the filename, for example `4n42nxv4j23j.mp4` instead.

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

// job2.json
{
    "actions": {
        "postrender": [
            {
                "module": "@nexrender/action-copy",
                "output": "D:/MyRenders/Results/",
                "useJobId": "true"
            }
        ]
    }
}
```

## Information

* `input` optional argument, path of the file you want to copy, can be either relative or absulte path. Defaults to current job output video file.
* `output` is a path on your system where result will be saved to, can be either relative or absulte path.
* `useJobId` optional argument, if set to `true`, and the output value is a folder instead of file, the output file will be saved in the destination folder with the job id used as the filename, for example `4n42nxv4j23j.mov` ins. Defaults to `false`.
