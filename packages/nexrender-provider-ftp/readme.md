# Provider: FTP

Allows nexrender to interact with an external FTP server to download or upload assets and/or results of rendering.

Refer to [mscdex/node-ftp](https://github.com/mscdex/node-ftp) for information regarding general abilities and usage.

## Installation

```
npm i @nexrender/provider-ftp -g
```

## Usage (download)

To download assets from an FTP server you would need to specify relevant information for every asset:

(Including hostname, port, username and pasword if needed).

```js
{
    "assets": [
        {
            "src": "ftp://root:password123132@ftp.example.com:2121/home/files/background.jpg",
            "type": "image",
            "layerName": "background.png"
        },
        {
            "src": "ftp://public-ftp.example.com/home/audio.mp3",
            "type": "audio",
            "layerName": "theme.mp3"
        }
    ]
}
````

## Usage (upload)

Upload via FTP can be done using [@nexrender/action-upload](packages/nexrender-action-upload)

Basic params info:

* `host` - string - The hostname or IP address of the FTP server. Default: 'localhost'
* `port` - integer - The port of the FTP server. Default: 21
* `user` - string - Username for authentication. Default: 'anonymous'
* `password` - string - Password for authentication. Default: 'anonymous@'

Example:

```js
{
    "actions": {
        "postrender": [
            {
                "module": "@nexrender/action-upload",
                "input": "result.mp4",
                "provider": "ftp",
                "params": {
                    "host": "ftp.example.com",
                    "port": 21,
                    "user": "root",
                    "password": "pass123123"
                }
            }
        ]
    }
}
