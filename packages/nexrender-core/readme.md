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
const { init, render } = require('@nexrender/core')

const settings = init({
    logger: console,
})

const main = async () => {
    const result = await render(/*myJobJson*/, settings)
}

main().catch(console.error);
```

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
* `multiFrames` - boolean, providing true will attmpt to use aerender's built-in feature of multi frame rendering (false by default)
* `maxMemoryPercent` - integer, undefined by default, check [original documentation](https://helpx.adobe.com/after-effects/using/automated-rendering-network-rendering.html) for more info
* `imageCachePercent` - integer, undefined by default, check [original documentation](https://helpx.adobe.com/after-effects/using/automated-rendering-network-rendering.html) for more info
* `addLicense` - boolean, providing false will disable ae_render_only_node.txt license file auto-creation (true by default)
* `forceCommandLinePatch` - boolean, providing true will force patch re-installation
