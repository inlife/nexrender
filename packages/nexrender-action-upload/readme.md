# Action: Upload

Upload video to an Amazon S3 bucket.

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
* `params` required argument, object containing parameters for the S3 put object request.