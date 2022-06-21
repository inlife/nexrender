# Provider: S3

Allows nexrender to interact with an Amazon Web Services S3 storage.

Refer to [aws/aws-sdk-js](https://github.com/aws/aws-sdk-js) for information regarding general abilities and usage.

## Installation

```
npm i @nexrender/provider-s3 -g
```

## Authentication

Providing credentials can be done in the following ways

### Credentials parameter

For both downloads and uploads you can provide a credentials object to the params with either an access key ID and a secret key, or an AWS profile name that's configured in ~/.aws/credentials

* `credentials.profile` optional argument, a specific AWS credentials profile to use for authentication.
* `credentials.accessKeyId` optional argument, a specific accessKeyId to use for authentication. Requires `secretAccessKey` to also be specified.
* `credentials.secretAccessKey` optional argument, a specific secretAccessKey to use for authentication. Requires `accessKeyId` to also be specified.

### Environment variables

You can provide either an access key ID and a secret key, or an AWS profile name that's configured in ~/.aws/credentials

You can do it in your current console session

```bat
; windows
set AWS_ACCESS_KEY="YOUR_ACCESS_KEY"
set AWS_SECRET_KEY="YOUR_SECRET_KEY"
; or

set AWS_PROFILE="YOUR_PROFILE_NAME"
```

```sh
# unix
export AWS_ACCESS_KEY="YOUR_ACCESS_KEY"
export AWS_SECRET_KEY="YOUR_SECRET_KEY"
# or
export AWS_PROFILE="YOUR_PROFILE_NAME"
```

### Cross-account role access pattern

For elaborate security enviroments you could be using _cross-account role access pattern_ to grant access to the assets and uploads.

All properties from the `credentials` object gets passed inside `params` passed to the ChainableTemporaryCredentrials constructor `{ params: { ...credentials } }`

* `credentials.RoleArn` required argument, Amazon Resource Name (ARN) of the role to assume.
* `credentials.RoleSessionName` required argument, an identifier for the assumed role session.
* `credentials.ExternalId` optional argument, a unique identifier that is common to be required when you assume a role in another account.
* other parameters that are supported by the SDK ChainableTemporaryCredentrials class.

To change the _master credentials_, adjust global AWS configuration before starting the job i.e. by environment variables or assigning an EC2 instance role.
For full list of parameters please refer to [JS SDK docs](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ChainableTemporaryCredentials.html#constructor_details)

## Usage (download)

To download assets from an S3 bucket you would need to specify relevant information for every asset:

Refer to [AWS SDK Documentation](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-credentials-node.html) for information on setting credentials.

```js
{
    "assets": [
        {
            "src": "s3://mybucket.s3.us-east-1.amazonaws.com/background.jpg",
            "type": "image",
            "layerName": "background.png"
        },
        {
            "src": "s3://myotherbucket.s3.amazonaws.com/audio.mp3",
            "type": "audio",
            "layerName": "theme.mp3",
            "params": {
                "credentials": {
                    "accessKeyId": "YOUR_ACCESS_KEY",
                    "secretAccessKey": "YOUR_SECRET_KEY"
                }
            }
        }
    ]
}
````

Uri follows this scheme:

```
s3://[BUCKET].s3.[REGION].amazonaws.com/[KEY]
```

If region is not provided, the default region of `us-east-1` will be used.

## Usage (upload)

Upload via FTP can be done using [@nexrender/action-upload](../nexrender-action-upload)

Basic params info:

* `region` required argument, the S3 bucket region
* `bucket` required argument, the S3 bucket
* `key` required argument, the object key
* `acl` required argument, the ACL
* `contentType` optional argument [default: `application/octet-stream`] the object ContentType, see: [API PutObject AWS S3](https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutObject.html#API_PutObject_RequestSyntax)
* `credentials`  optional argument, see: [credentials parameter](#credentials-parameter)

Example:

```js
{
    "actions": {
        "postrender": [
            {
                "module": "@nexrender/action-upload",
                "input": "result.mp4",
                "provider": "s3",
                "params": {
                    "region": "us-east-1",
                    "bucket": "name-of-your-bucket",
                    "key": "folder/output.mp4",
                    "acl": "public-read",
                    "contentType": "video/mp4",
                    "credentials": {
                        "profile": "YOUR_PROFILE_NAME"
                    }
                }
            }
        ]
    }
}
