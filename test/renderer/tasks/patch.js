'use strict';

const chai      = require('chai');
const chaiAsFs  = require('chai-fs');
const chaiProm  = require('chai-as-promised');
const fs        = require('fs-extra');
const path      = require('path');
const rewire    = require('rewire');

chai.use(chaiAsFs);
chai.use(chaiProm);

global.should = chai.should();

// require module
var patch = require('../../../renderer/tasks/patch.js');
var patch = rewire('../../../renderer/tasks/patch.js');

describe('Task: patch', () => {

    let project;

    beforeEach(() => {
        project = { template: 'proj.aepx', workpath: 'test', assets: [{ type: 'script' }] }
    });

    afterEach(() => {
        fs.removeSync( path.join('test', 'proj.aepx') );
    });

    it('should not patch if no script or data asset were passed', (done) => {
        project.assets = [];
        patch(project).should.be.fulfilled.notify(done);
    });

    it('should skip other assets thet were passed', (done) => {
        project.assets = [{ type: 'image' }];
        patch(project).should.be.fulfilled.notify(done);
    });

    it('should raise error if project file was not found', (done) => {
        patch(project).should.be.rejected.notify(done);
    });

    it('should raise error if project is not valid', (done) => {
        fs.writeFileSync( path.join('test', 'proj.aepx'), 'some invalid format');
        patch(project).should.be.rejected.notify(done);
    });

    describe('#getAllExpressions()', () => {
        it('should match all expression tags', () => {
            let get = patch.__get__('getAllExpressions');

            should.equal( get(''), null );
            should.equal( get('test string with words'), null );
            should.equal( get('test string with <different tags="123123123123"/> and etc'), null );
            should.equal( get('test string with <expr wrong="123123123123"/> and etc'), null );

            let tags1 = [
                '<expr bdata="abcdef1234567890"/>',
                'test string with <expr bdata="abcdef1234567890"/> and etc',
                'test\r\n\t string\n\r\t with <expr bdata="abcdef1234567890"/>\n\r\t and etc',
                'test\r\n\t <data expr bdata="12313231" /> string\n\r\t with <expr bdata="abcdef1234567890"/>\n\r\t and etc',
            ];

            for (let tag of tags1) {
                get(tag).should.be.instanceof(Array).and.have.lengthOf(1);
            }

            let tags2 = [
                '<expr bdata="abcdef12345890"/><expr bdata="abf1234567890"/>',
                'test string with <expr bdata="abcdef1234567890"/> and etc test string with <expr bdata="abcdef1234567890"/> and etc',
                'test\r\n\t string\n\r\t with <expr bdata="abcdef1234567890"/>\n\r\t and etc string\n\r\t with <expr bdata="abcdef1234567890"/>\n\r\t and etc',
                'test\r\n\t <data expr bdata="12313231" /> string\n\r\t with <expr bdata="abcdef1234567890"/>\n\r\t and etc test\r\n\t <data expr bdata="12313231" /> string\n\r\t with <expr bdata="abcdef1234567890"/>\n\r\t and etc',
            ];

            for (let tag of tags2) {
                get(tag).should.be.instanceof(Array).and.have.lengthOf(2);
            }
        });

    });

    describe('#replacePath()', () => {

        it('should replace all usual os paths', () => {
            let replace = patch.__get__('replacePath');
            let pathStrings = [
                '/final.js',
                '/Users/final.js',
                '/Users/sub/final.js',
                '/Users/sub/directory/final.js',
                '/Users/sub-directory/with_symbols/final.js',
                '~/tilda/starts_test/final.js',

                'C:\\final.js',
                'C:\\sub\\final.js',
                'C:\\sub\\directory\\final.js',
                'D:\\sub-directory\\with_symbols\\final.js'
            ];

            for (let string of pathStrings) {
                replace(string, '[repl]').should.be.eql('[repl]final.js');
            }
        });

        it('should replace only paths inside simple js code', () => {
            let replace = patch.__get__('replacePath');
            let pathStrings = [
                '/final.js',
                '/Users/final.js',
                '/Users/123/su123b/final.js',
                '/Users/sub/d123irectory/final.js',
                '/Users/sub-directory/with_symbols/final.js',
                '~/tilda/starts_test/final.js',

                'C:\\final.js',
                'C:\\sub\\final.js',
                'C:\\sub\\123\\directory\\final.js',
                'D:\\sub-directory\\with_symbols\\final.js'
            ];

            for (let string of pathStrings) {
                string = '$.evalFile(\"' + string + '\"); exports.start(time / 5); '
                replace(string, '[repl]').should.be.eql( 
                    '$.evalFile(\"[repl]final.js\"); exports.start(time / 5); '
                );
            }
        });

        it('should patch all different paths in the project file', (done) => {
            // prepare data
            let bexpr = '$.evalFile(\"[mypath]final.js\"); exports.get(\"sometnigs\", time / 24)';
            let expr1 = new Buffer(bexpr.replace('[mypath]', '/Users/sub-directory/with_symbols/')).toString('hex');
            let expr2 = new Buffer(bexpr.replace('[mypath]', 'D:\\sub-directory\\with_symbols\\')).toString('hex');

            // create file
            let data = ['<?xml',
                `<expr bdata="${expr1}" />`,
                `long string many things<expr bdata="${expr2}"/> other things`,
                'just new line',
                `long string many things again epxr 1<expr bdata="${expr1}"/> things`,
            ];

            fs.writeFileSync( path.join('test', 'proj.aepx'), data.join('\n') );

            patch(project).should.be.fulfilled.then(() => {
                let data = fs.readFileSync( path.join('test', 'proj.aepx') ).toString('utf8');
                let expressions = patch.__get__('getAllExpressions')(data);

                for (let expr of expressions) {
                    let hex = expr.split('"')[1];
                    let dec = new Buffer(hex, 'hex').toString('utf8');

                    dec.should.be.eql(bexpr.replace('[mypath]', 
                        path.join( process.cwd(), project.workpath, path.sep )
                    ));
                }
            }).should.notify(done);
        });
    });
});
