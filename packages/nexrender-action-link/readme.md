# Action: Link

Create symbolic links between files or directories.

## Information

* `input` required argument, source path for the symbolic link, can be either relative or absolute path
* `output` required argument, destination path where the symbolic link will be created, can be either relative or absolute path
* `type` optional argument, type of symbolic link to create:
  * `dir` - Create a directory symbolic link (default)
  * `file` - Create a file symbolic link
  * `junction` - Create a directory junction (Windows only)

The action will:
1. Create any necessary parent directories for the output path
2. Remove any existing symbolic link at the output path
3. Create a new symbolic link from input to output

Note: Creating symbolic links may require elevated permissions on some systems.

## Usage

```json
{
    "actions": {
        "prerender": [
            {
                "module": "@nexrender/action-link",
                "input": "source/large-file.mp4",
                "output": "assets/linked-file.mp4"
            }
        ]
    }
}
```

## License

Please refer to the [LICENSE](LICENSE) file for more information. Unlike the main nexrender project, this plugin is licensed under the AGPL-3.0 license.
