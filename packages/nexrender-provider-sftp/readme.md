# Provider: SFTP

Allows nexrender to interact with an external SFTP server to upload results of rendering.

Refer to [theophilusx/ssh2-sftp-client](https://github.com/theophilusx/ssh2-sftp-client) for information regarding general abilities and usage.

## Installation

```
npm i @nexrender/provider-sftp -g
```

## Usage (upload)

Upload via SFTP can be done using [@nexrender/action-upload](../nexrender-action-upload)

Basic params info:

* `host` - string - The hostname or IP address of the FTP server. Default: 'localhost'
* `port` - integer - The port of the FTP server. Default: 21
* `user` - string - Username for authentication. Default: 'anonymous'
* `password` - string - Password for authentication. Default: 'anonymous@'
* `output` - string - Optional argument to notify how you want to save your file on a remote machine as

Example:

```js
{
    "actions": {
        "postrender": [
            {
                "module": "@nexrender/action-upload",
                "input": "result.mp4",
                "provider": "sftp",
                "params": {
                    "host": "sftp.example.com",
                    "port": 22,
                    "user": "root",
                    "password": "pass123123",
                    "output": "/var/mystuff/output.mp4"
                }
            }
        ]
    }
}
