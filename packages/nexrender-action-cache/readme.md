# Action: Cache

Cache your template source to a specified location and reuse it on subsequent runs

## Installation

```
npm i -g @nexrender/action-cache
```

## Usage

When creating your render job provide this module in **both** of the `predownload` and `postdownload` actions:

## Additional Params
- ttl (optional): a time-to-live in milliseconds for which after that the cached item is invalidated

```js
// job.json
{
    "actions": {
        "predownload": [
            {
                "module": "@nexrender/action-cache",
                "cacheDirectory": "~/cache",
                "ttl": 3600000
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
