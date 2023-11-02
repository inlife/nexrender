// simple syntax test
require('../src')
const path = require('path')
const os = require("os");

const chai = require('chai')
const expect = chai.expect

// TODO: move specific unittest tests into .spec files next to the tested code 
describe('tasks/script/EnhancedScript', () => {

    const EnhancedScript = require('../src/tasks/script/EnhancedScript')

    // test for enhancedScript.findMissingMatchesInJSX
    it("Finds parameters in jsx with missing values in json", () => {
        const enhancedScript = new EnhancedScript(path.resolve('./packages/nexrender-core/test/fixtures/paramInject.jsx'), 'src', [
            {
                key: "unittest_defined_parameter",
                value: "VALUE"
            },
        ], 'NX', {}, 'unittest', console);
        //enhancedScript.build();

        const anyMissing = enhancedScript.findMissingMatchesInJSX();
        expect(anyMissing).true;
        expect(enhancedScript.missingJSONParams.map((o) => { return o.key})).to.have.members(['unittest_undefined_parameter'])
    })

    // test for enhancedScript.parseMethodWithArgs
    
    // test for enhancedScript.parseMethod


})



describe('tasks/script', () => {

    // import os module
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
                    "key": "unittest_defined_parameter",
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
    xit("Parses method with args", async () => {
        await download(job, settings)
        console.log(script)
        await script(job, settings)
    })

    // test EnhancedScript.prototype.parseMethod
    // test EnhancedScript.prototype.findMissingMatchesInJSX
    xit("Finds missing matches in jsx script", () => {
    })


})