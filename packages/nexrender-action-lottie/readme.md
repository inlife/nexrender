# Action: Lottie

(alpha version)

An action that can be used to render AE compositions into lottie HTML banners.

Currently only "banner" type is supported.

## Usage

```json
{
    "actions": {
        "predownload": [
            {
                "module": "@nexrender/action-lottie",
                "banner": {
                    "lottie_origin": "local",
                    "lottie_renderer": "svg",
                    "lottie_library": "full",
                    "use_original_sizes": true,
                    "width": 500,
                    "height": 500,
                    "click_tag": "#",
                    "shouldLoop": true,
                    "loopCount": 0
                }
            }
        ],
        "postrender": [
            {
                "module": "@nexrender/action-compress",
                "format": "zip",
                "input": ["banner"],
                "output": "banner.zip"
            }
        ]
    }
}
```

## Parameters

Parameters fully replicate the parameter structure of lottie in Bodymovin.


## License

Please refer to the [LICENSE](LICENSE) file for more information. Unlike the main nexrender project, this plugin is licensed under the AGPL-3.0 license.
