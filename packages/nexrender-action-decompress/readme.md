# Action Decompress

Decompress/extract your zip-archived template file and/or assets to the project work directory.

## Installation

If you are using [binary](https://github.com/inlife/nexrender/releases) version of the nexrender,
there is no need to install the module, it is **included** in the binary build.

```
npm i @nexrender/action-decompress -g
```

## Usage

When creating your render job provide this module as one of the `prerender` actions:

Options:

- `format` - format of the archive to decompress, currently only `zip` is supported
- `overwrite` - if set to `true`, it will overwrite existing files in the project work directory on name conflict, default is `false`

```json
// job.json
{
    "actions": {
        "prerender": [
            {
                "module": "@nexrender/action-decompress",
                "format": "zip",
                "overwrite": false,
            }
        ]
    }
}
```
