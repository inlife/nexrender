# Action: Upload

Upload video to an external storage provider ie. Amazon S3.

## Installation

```
npm i @nexrender/action-upload -g
```

## Usage

When creating your render job provide this module as one of the `postrender` actions:

```json
// job.json
{
    "actions": {
        "postrender": [
            {
                "module": "@nexrender/action-upload",
                "input": "",
                "provider": "s3",
                "params": {
                    "region": "us-east-1",
                    "bucket": "name-of-your-bucket",
                    "key": "folder/output.mp4",
                    "acl": "public-read"
                }
            }
        ]
    }
}
```

## Information

* `input` optional argument, path of the file you want to encode, can be either relative or absulte path. Defaults to current job output video file.
* `provider` required argument, object containing the name of the provider
* `params` required argument, object containing parameters for the upload (provider-specific)

## Providers

Currently, only Amazon S3 is supported at this time.

### s3

```js
{
    'region': 'us-east-1',
    'bucket': 'name-of-your-bucket',
    'key': 'folder/output.mp4',
    'acl': 'public-read'
}
```
* `region` required argument, the S3 bucket region
* `bucket` required argument, the S3 bucket
* `key` required argument, the object key
* `acl` required argument, the ACL