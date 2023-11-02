// simple syntax test
require('../src')

//const td = require('testdouble')

describe('tasks/script', () => {

    // import os module
    const os = require("os");
    const path = require("path");
    // get temp directory
    const script = require('../src/tasks/script');
    //const script = td.replace('../src/tasks/script');

    const download = require('../src/tasks/download');

    const url = require('url');
    
    // wrapEnhancedScript tests
    const job = {
        uid: 'unittest',
        workpath: path.join(os.tmpdir(), 'nexrender'),
        template: {
            src: url.pathToFileURL(path.resolve('./packages/nexrender-core/test/fixtures/fake_aep.aep')).toString(),
            composition: 'unittest_composition',
        },
        assets: [{
                'src': url.pathToFileURL(path.resolve('./packages/nexrender-core/test/fixtures/paramInject.jsx')).toString(),
                'type': 'script',
                'parameters': [{
                    "key": "defined_parameter",
                    "value": "VALUE"
                }, {
                    "key" : "onePlusOne",
                    "value": "(function(num) { return num+1; })()",
                    "arguments": [
                        {
                            "key" : "num",
                            "value" : 1
                        },
                        {
                            "key" : "location",
                            "value": "10th St. & Constitution Ave."
                        }
                    ]
                }
                ]
            },
        ],
    }

    const settings = {
        logger: console,
        trackCombined: () => {},
    }

    // test EnhancedScript.prototype.parseMethodWithArgs
    it("Parses method with args", async () => {
        await download(job, settings)
        console.log(script)
        await script(job, settings)
    })


    // test EnhancedScript.prototype.parseMethod
    // test EnhancedScript.prototype.findMissingMatchesInJSX
    it("Finds missing matches in jsx script", () => {
        
    })




})