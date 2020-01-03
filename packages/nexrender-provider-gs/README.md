# Provider: GCS

Allows nexrender to interact with a Google Cloud Storage (GCS) bucket.

Refer to [@google-cloud/storage](https://github.com/googleapis/nodejs-storage) for information regarding general abilities and usage.

## Installation

```
npm i @nexrender/provider-gs -g
```

You most likely need to authenticate to interact with a GCS bucket. This provider uses _Application Default Credentials_. Refer to the [Google Cloud Documentation](https://cloud.google.com/docs/authentication/getting-started) for more information on authentication.

## Usage (download)

To download assets from a GCS bucket, you can use the `gs://` prefix in the value of the `src` attribute.

```js
{
    "assets": [
        {
            "src": "gs://mybucket/background.jpg",
            "type": "image",
            "layerName": "background.png"
        },
        {
            "src": "gs://myotherbucket/audio.mp3",
            "type": "audio",
            "layerName": "theme.mp3"
        }
    ]
}
````

Uri follows this scheme:

```
gs://[BUCKET]/[ITEM]
```

## Usage (upload)

Upload via GCS can be done using [@nexrender/action-upload](../nexrender-action-upload)

Basic params info:

* `bucket` required argument, the GCS bucket
* `item` required argument, the item ID
* `contentType` optional argument, the content-type of the upload, which will be set as metadata on
  the bucket item

Example:

```js
{
    "actions": {
        "postrender": [
            {
                "module": "@nexrender/action-upload",
                "input": "result.mp4",
                "provider": "gs",
                "params": {
                    "bucket": "name-of-your-bucket",
                    "item": "folder/output.mp4",
                    "contentType": "video/mp4"
                }
            }
        ]
    }
}
