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
                "options": { "output": "/home/videos" }
            }
        ]
    }
}
```
