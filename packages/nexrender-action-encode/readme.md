# Action: Encode

Encode your video to a specified format using built-in ffmpeg utility. You don't need to have ffmpeg installed on your system.

## Installation

If you are using [binary](https://github.com/inlife/nexrender/releases) version of the nexrender,
there is no need to install the module, it is **included** in the binary build.

```
npm i @nexrender/action-encode -g
```

## Usage

When creating your render job provide this module as one of the `postrender` actions:

```json
// job.json
{
    "actions": {
        "postrender": [
            {
                "module": "@nexrender/action-encode",
                "output": "foobar.mp4",
                "preset": "mp4",
                "params": {"-vcodec": "libx264", "-r": 25}
            }
        ]
    }
}
```

## Information

* `output` is a path on your system where result will be saved to, can be either relative or absulte path.
* `input` optional argument, path of the file you want to encode, can be either relative or absulte path. Defaults to current job output video file.
* `preset` optional argument, if provided will be used as a preset for the renderer, if not, will take input directly from params
* `params` optional argument, object containing additional params that will be provided to the ffmpeg binary

## Presets

There are a couple of default presets included with the build. You can provide `params` field to override any of the values there.

### mp4

```js
{
    '-acodec': 'aac',
    '-ab': '128k',
    '-ar': '44100',
    '-vcodec': 'libx264',
    '-r': '25',
}
```

### ogg

```js
{
    '-acodec': 'libvorbis',
    '-ab': '128k',
    '-ar': '44100',
    '-vcodec': 'libtheora',
    '-r': '25',
}
```

### webm

```js
{
    '-acodec': 'libvorbis',
    '-ab': '128k',
    '-ar': '44100',
    '-vcodec': 'libvpx',
    '-b': '614400',
    '-aspect': '16:9',
}
```

### mp3

```js
{
    '-acodec': 'libmp3lame',
    '-ab': '128k',
    '-ar': '44100',

}
```

### m4a

```js
{
    '-acodec': 'aac',
    '-ab': '64k',
    '-ar': '44100',
    '-strict': '-2',
}
```
