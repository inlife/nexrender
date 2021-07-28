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
        "postrender": [
            {
                "module": "@nexrender/action-cache",
                "cacheDirectory": "~/cache"
            }
        ]
    }
}
```
