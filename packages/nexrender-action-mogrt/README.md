# nexrender-action-mogrt-template

This plugin adds .mogrt support to Nexrender.

## Install

`npm install nexrender-action-mogrt-template`

## How to use

1. Set a .mogrt file as the `template.src` value
2. Add this module in predownload actions
3. Add any Essential Graphics parameters you want to change as `essentialParameters`


```json
{
    "template": {
        "src": "http://www.foo.com/template.mogrt",
        "composition": "will_be_ignored"
    },
    "actions": {
        "predownload": [
            {
                "module": "nexrender-action-mogrt-template",
                "essentialParameters": {
                    "Title": "This should be the title",
                    "Dropdown": 2,
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
* Media replacement through essential graphics isn't supported (yet), but normal asset injection with Nexrender will work
* Invalid .mogrt files will cause an error
