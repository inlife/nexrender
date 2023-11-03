// simple syntax test
const path = require('path')
const fs = require('fs')
const os = require("os");
const chai = require('chai')
const expect = chai.expect

// TODO: move specific unittest tests into .spec files next to the tested code 
describe('tasks/script/EnhancedScript', () => {
    const EnhancedScript = require('./EnhancedScript')
    const testJsxFilePath = path.join(os.tmpdir(), 'unittest.jsx')


    // test for enhancedScript.findMissingMatchesInJSX
    it("Finds parameters in jsx with missing values in json", () => {

        fs.writeFileSync(testJsxFilePath,`
            /* var c = NX.get('unittest_undefined_parameter_multi_line_comment')
            */
            // var d = NX.get('unittest_undefined_parameter_single_line_comment')
            var a = NX.get('unittest_undefined_parameter')
            var b = NX.get('unittest_defined_parameter')
        `);

        const enhancedScript = new EnhancedScript(testJsxFilePath, 'src', [
            {
                key: 'unittest_defined_parameter',
                value: 'VALUE'
            },
        ], 'NX', {}, 'unittest', console);

        const anyMissing = enhancedScript.findMissingMatchesInJSX();
        expect(anyMissing).true;
        expect(enhancedScript.missingJSONParams.map((o) => { return o.key})).to.have.members(['unittest_undefined_parameter'])

        expect(enhancedScript.injectParameters()).to.equal(
            [`NX.set('unittest_defined_parameter', "VALUE");`,
            `NX.set('unittest_undefined_parameter', undefined);`].join('\n'));


    })

    // test for enhancedScript.parseMethodWithArgs


    // test for enhancedScript.parseMethod

    // test for verifying injection of parameters into jsx
})
