# Action: Cache

Cache your template source to a specified location and reuse it on subsequent runs

## Installation

```
npm i -g @nexrender/action-cache
```

## Usage

When creating your render job provide this module in **both** of the `predownload` and `postdownload` actions:

```js
// job.json
{
    "actions": {
        "predownload": [
            {
                "module": "@nexrender/action-cache",
                "cacheDirectory": "~/cache"
            }
        ],
        "postdownload": [
            {
                "module": "@nexrender/action-cache",
                "cacheDirectory": "~/cache"
            }
        ],
    }
}
```
