# nexrender-action-mogrt-template

This plugin adds .mogrt support to Nexrender.

## Install

`npm install nexrender-action-mogrt-template`

## How to use

1. Set a .mogrt file as the `template.src` value
2. Add this module in predownload actions
3. Add any Essential Graphics parameters you want to change as `params`
4. Use unique layer names in the .mogrt file to reference assets to leverage nexrender built-in asset substitution


```json
{
    "template": {
        "src": "http://www.foo.com/template.mogrt",
        "composition": "will_be_ignored"
    },
    "assets": [
        {
            "type": "image",
            "src": "http://www.foo.com/image.png",
            "layerName": "$ref-layer-1"
        },
        {
            "type": "image",
            "src": "http://www.foo.com/image2.png",
            "layerName": "$ref-layer-2"
        }
    ],
    "actions": {
        "predownload": [
            {
                "module": "nexrender-action-mogrt-template",
                "params": {
                    "Title": "This should be the title",
                    "Dropdown": 2,
                        "Group Name": {
                        "Some Name": "Some Value",
                        "Another Name": 123
                    },
                    "My First Image": "$ref-image-1",
                    "My Second Image": "$ref-image-2"
                    "Scale": [50, 50],
                    "Checkbox": true,
                    "Point Control:": [30, 50],
                    "Angle": 720,
                    "Colour": [0.7, 0.2, 0],
                    "Slider": 50,
                    "Scale": [50, 50]
                }
            }
        ],

```

## Notes

* Any `template.src` without a .mogrt extension will be ignored
* The value in `template.composition` will be ignored, as .mogrt files specify what composition to use on their own, but Nexrender requires one to be specified
* Invalid .mogrt files will cause an error


## License

Please refer to the [LICENSE](LICENSE) file for more information. Unlike the main nexrender project, this plugin is licensed under the AGPL-3.0 license.
