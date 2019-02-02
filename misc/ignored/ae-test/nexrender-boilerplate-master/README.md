# nexrender-boilerplate
Boilerplate project for rendering a video using nexrender.

In case you are not familiar with **nexrender** i invite you to read more about at: https://github.com/Inlife/nexrender

This example shows you how to use nexrender locally (without setting up whole network) as a tool for creating dynamic personalized videos. In this example I use a real template that I made for a YouTube video channel I manage: [Noxcaos Music](https://www.youtube.com/channel/UC2D9WSUKnyTX8wWqNVITTAw). (most of those videos are made using nexrender).

Current template showcases changes for:

* background image
* background color overlay
* current playing track name
* current playing track artist(s)
* current track in tracklist indicator
* current track progress

## Super important:

**If you want to make changes to a template, please note that Adobe After Effects has a "bug":**

If you are making changes and save the project, Adobe After Effects will store paths to related assets. But it will try to access them by absolute paths first, and then, if it can't find them, will fallback to relative paths. 

So if you saved a project in some folder `/Users/me/prj/`, the `aerender` binary at render runtime will try to search for the asset files in that folder first and as result won't use **asset substitution** at all. So I recommend you either delete the assets in that folder (`/Users/me/prj/`) or move/rename this folder. This will force `aerender` to search for files in relative context (near the project file), which is just what we need!

## Installation/Usage

You need to have `node.js` *>= 4* and `npm` installed.
And Adobe After Effects (obviously).

**!Note: dont forget to configure AE outputModule to your needs: [details](https://helpx.adobe.com/after-effects/using/basics-rendering-exporting.html#output_modules_and_output_module_settings). Usually i use h264 output codec and call the outputModule respectively.**

1. download or clone repo (`$ git clone https://github.com/Inlife/nexrender-boilerplate.git`)
2. install dependencies (`$ npm install`)
3. configure `start.js` script; set path to your aerender binary
4. start rendering (`$ node start.js`)
5. success ?

