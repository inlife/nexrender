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
                "input": "output.mp4",
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

* `input` optional argument, path of the file you want to upload, can be either relative or absulte path. If skipped, defaults to current job output video file.
* `provider` required argument, object containing the name of the provider
* `params` required argument, object containing parameters for the upload (provider-specific)

## Providers

### s3
Refer to [AWS SDK Documentation](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-credentials-node.html) for information on setting credentials.

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


### ftp

Refer to [mscdex/node-ftp](https://github.com/mscdex/node-ftp) for information regarding porams and usage.

Basic params info:

* `host` - string - The hostname or IP address of the FTP server. Default: 'localhost'
* `port` - integer - The port of the FTP server. Default: 21
* `user` - string - Username for authentication. Default: 'anonymous'
* `password` - string - Password for authentication. Default: 'anonymous@'

Example:

```js
{
    'host': 'ftp.example.com',
    'port': 21,
    'user': 'myuser',
    'password': 'mypassword123'
}
```
