# Worker

A CLI application which is responsible mainly for actual job processing and rendering,
communication with the `nexrender-server`, and serves mainly as a consumer in the nexrender network model.

#### Supported platforms:
Windows, macOS

#### Requirements:
Installed licensed/trial version of Adobe After Effects

## Binary

### Installation

You can download binaries directly from the [releases](https://github.com/inlife/nexrender/releases) section

### Usage

```sh
$ nexrender-worker \
        --host=https://my.server.com:3050 \
        --secret=myapisecret
```

> Note: its recommended to run `nexrender-worker -h` at least once, to read all useful information about available options.

## Programmatic

### Installation

Install the [@nexrender/worker](https://github.com/inlife/nexrender/tree/master/packages/nexrender-worker)

```sh
$ npm install @nexrender/worker --save
```

### Usage

And then load it, and run it

```js
const { start } = require('@nexrender/worker')

const main = async () => {
    const serverHost = 'http://localhost:3000'
    const serverSecret = 'mysecret'

    await start(serverHost, serverSecret, {
        workpath: '/Users/myname/.nexrender/',
        binary: '/Users/mynames/Applications/aerender',
        skipCleanup: true,
        tagSelector: false,
        addLicense: false,
        debug: true,
        actions: {
            "custom-action": (job, settings, {input, params}, type) => {
                // Custom action code
            }
        },
    })
}

main().catch(console.error);
````

### Information

Available settings (almost same as for `nexrender-core`):

* `workpath` - string, manually set path to working directory where project folder will be created, overrides default one in system temp folder
* `binary` - string, manually set path pointing to the aerender(.exe) binary, overrides auto found one
* `debug` - boolean, enables or disables debug mode, false by default
* `skipCleanup` - boolean, providing true will prevent nexrender from removing the temp folder with project (false by default)
* `skipRender` - boolean, providing true will prevent nexrender from running actual rendering, might be useful if you only want to call scripts
* `multiFrames` - boolean, providing true will attmpt to use aerender's built-in feature of multi frame rendering (false by default)
* `multiFramesCPU` - integer between 1-100, the percentage of CPU used by multi frame rendering, if enabled (90 by default)
* `reuse` - boolean, false by default, (from Adobe site): Reuse the currently running instance of After Effects (if found) to perform the render. When an already running instance is used, aerender saves preferences to disk when rendering has completed, but does not quit After Effects. If this argument is not used, aerender starts a new instance of After Effects, even if one is already running. It quits that instance when rendering has completed, and does not save preferences.
* `maxMemoryPercent` - integer, undefined by default, check [original documentation](https://helpx.adobe.com/after-effects/using/automated-rendering-network-rendering.html) for more info
* `imageCachePercent` - integer, undefined by default, check [original documentation](https://helpx.adobe.com/after-effects/using/automated-rendering-network-rendering.html) for more info
* `addLicense` - boolean, providing false will disable ae_render_only_node.txt license file auto-creation (true by default)
* `forceCommandLinePatch` - boolean, providing true will force patch re-installation
* `stopOnError` - boolean, stop the pick-up-and-render process if an error occurs (false by default)
* `polling` - number, amount of miliseconds to wait before checking queued projects from the api, if specified will be used instead of NEXRENDER_API_POLLING env variable
* `header` - string, Define custom header that the worker will use to communicate with nexrender-server. Accepted format follows curl or wget request header definition, eg. `--header="Some-Custom-Header: myCustomValue"`.
* `tagSelector` - string, (optional) provide the string tags (example `primary,plugins,halowell` : comma delimited) to pickup the job with specific tags. Leave it false to ignore and pick a random job from the server with no specific tags. Tags name must be an alphanumeric.
* `wslMap` - string, drive letter of your WSL mapping in Windows
* `aeParams` - array of strings, any additional params that will be passed to the aerender binary, a name-value parameter pair separated by a space,
* `actions` - an object with keys corresponding to the `module` field when defining an action, value should be a function matching expected signature of an action. Used for defining actions programmatically without needing to package the action as a separate package
* `cache` - boolean or string. Set the cache folder used by HTTP assets. If `true` will use the default path of `${workpath}/http-cache`, if set to a string it will be interpreted as a filesystem path to the cache folder.

