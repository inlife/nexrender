# Core

In case you are building your own application and just need to use a rendering part, or you wanna manually trigger jobs from your code,
there is a way to use nexrender programmatically:

## Installation
Install the [@nexrender/core](https://github.com/inlife/nexrender/tree/master/packages/nexrender-core)

```sh
$ npm install @nexrender/core --save
```

## Usage

And then load it, and run it

```js
const { render } = require('@nexrender/core')

const main = async () => {
    const result = await render(/*myJobJson*/)
}

main().catch(console.error);
```

Or you can go more advanced, and provide some settings as your 2nd argument to the `render` function:

```js
const { render } = require('@nexrender/core')

const main = async () => {
    const result = await render(/*myJobJson*/, {
        workpath: '/Users/myname/.nexrender/',
        binary: '/Users/mynames/Applications/aerender',
        skipCleanup: true,
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

## Information

The module reuturns 2 methods, `init` and `render`.

First one is responsible for setting up the env, checking if all needed patches for AE are in place,
automatically adding render-only license file for a free usage of Adobe's product (unless disabled), and a few other minor things.

Second one is responsible for mainly job-related operations of the full cycle: downloading, rendering, processing, and uploading.

`init` accepts an object, containing additional options:

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
* `onInstanceSpawn` - a callback, if provided, gets called when **aerender** instance is getting spawned, with instance pointer. Can be later used to kill a hung aerender process. Callback signature: `function (instance, job, settings) {}`
* `actions` - an object with keys corresponding to the `module` field when defining an action, value should be a function matching expected signature of an action. Used for defining actions programmatically without needing to package the action as a separate package
* `cache` - boolean or string. Set the cache folder used by HTTP assets. If `true` will use the default path of `${workpath}/http-cache`, if set to a string it will be interpreted as a filesystem path to the cache folder.
