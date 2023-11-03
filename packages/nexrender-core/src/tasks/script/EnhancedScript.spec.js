// simple syntax test
const path = require('path')
const fs = require('fs')
const os = require("os");
const chai = require('chai')
const expect = chai.expect

describe('tasks/script/EnhancedScript', () => {
    const EnhancedScript = require('./EnhancedScript')

    const testJsxFilePath = path.join(os.tmpdir(), 'unittest.jsx')

    it("Finds parameters in jsx with missing values in json and injects", () => {
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

    it("injects functions and functions with arguments", () => {

        //FIXME: NX.get('unittest_undefined_function', 'arg1')  is currently not found and no warning is given
        fs.writeFileSync(testJsxFilePath,`
            var a = NX.get('unittest_undefined_function', 'arg1') 
            var b = NX.get('eventInvitation')
        `);

        const enhancedScript = new EnhancedScript(testJsxFilePath, 'src', [
            {
                "key" : "invitees",
                "value": ["Steve", "Natasha", "Tony", "Bruce", "Wanda", "Thor", "Peter", "Clint" ]
            },
            {
                "key" : "eventInvitation",
                "value": `(function (venue) { alert( 'This years' Avengers Gala is on the prestigious ' + venue.name + ' located at ' + venue.location + '. Our special guests ' + NX.get('invitees').value.map(function (a, i) { return (i == NX.get('invitees').value.length - 1) ? ' and ' + a + ' (whoever that is)' : a + ', '; }).join('') + '  going to be present for the ceremony!');
        })({ name: NX.arg('venue'), location: NX.arg('location') })`,
                "arguments": [
                    {
                        "key" : "venue",
                        "value" : "Smithsonian Museum of Natural History"
                    },
                    {
                        "key" : "location",
                        "value": "10th St. & Constitution Ave."
                    },
                ]
            },
            {
                "type": "array",
                "key" : "dogs",
                "value": [ "Captain Sparkles", "Summer", "Neptune"]
            },
            {
                "type" : "number",
                "key" : "anAmount"
            },
            {
                "type": "function",
                "key": "getDogsCount",
                "value" : "function() { return NX.get('dogs').length; }"
            },
            {
                "type": "function",
                "key": "exampleFn",
                "value": "function ( parameter ) { return parameter; }"
            },
            {
                "type" : "function",
                "key" : "dogCount",
                "value" : "(function(length) { return length })(NX.arg('dogCount'))",
                "arguments": [
                    {
                        "key" : "dogCount",
                        "value": ["NX.call('exampleFn', [NX.call('getDogsCount') + NX.get('anAmount')])"]
                    }
                ]
            }
        ], 'NX', {}, 'unittest', console);

        // TODO: test functions are correct in build script


        const anyMissing = enhancedScript.findMissingMatchesInJSX();
        expect(anyMissing).false;

        const injected = enhancedScript.injectParameters();

        expect(injected).to.equal([
            `NX.set('invitees', ["Steve","Natasha","Tony","Bruce","Wanda","Thor","Peter","Clint"]);`,
            `NX.set('eventInvitation', (function (venue) { alert( 'This years' Avengers Gala is on the prestigious ' + venue.name + ' located at ' + venue.location + '. Our special guests ' + NX.get('invitees').value.map(function (a, i) { return (i == NX.get('invitees').value.length - 1) ? ' and ' + a + ' (whoever that is)' : a + ', '; }).join('') + '  going to be present for the ceremony!');
        })({ name: NX.arg('venue'), location:10th St. & Constitution Ave. }));`,
            `NX.set('dogs', ["Captain Sparkles","Summer","Neptune"]);`,
            `NX.set('anAmount', undefined);`,
            `NX.set('getDogsCount', function() { return NX.get('dogs').length; });`,
            `NX.set('exampleFn', function ( parameter ) { return parameter; });`,
            `NX.set('dogCount', (function(length) { return length })(NX.call('exampleFn', [NX.call('getDogsCount') + NX.get('anAmount')])));`
        ].join('\n'))
    })
})
