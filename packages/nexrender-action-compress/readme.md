# Action Compress

(alpha version)

Compress any files from the project work directory to the archive.

## Installation

If you are using [binary](https://github.com/inlife/nexrender/releases) version of the nexrender,
there is no need to install the module, it is **included** in the binary build.

```
npm i @nexrender/action-compress -g
```

## Usage

When creating your render job provide this module as one of the `prerender` actions:

Options:

- `format` - format of the archive to compress, currently only `zip` is supported
- `input` - array of files to compress, can be a glob pattern, can be name of a folder, file or image sequence name
- `output` - name of the output archive

```json
// job.json
{
    "actions": {
        "prerender": [
            {
                "module": "@nexrender/action-compress",
                "format": "zip",
                "input": [
                    "project.aep",
                    "results__[#####].png",
                    "output_dir"
                ],
                "output": "output.zip",
            }
        ]
    }
}
```


## License

Please refer to the [LICENSE](LICENSE) file for more information. Unlike the main nexrender project, this plugin is licensed under the AGPL-3.0 license.
