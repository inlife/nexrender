const assert = require('assert');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const decompressAction = require('./index');
const { describe, it, before, after } = require('mocha');

describe('decompressAction', function() {
    const workpath = path.join(__dirname, 'test-workpath');

    // Setup for tests: create zip files and write a non-archive file
    before(function() {
        // Create test workpath directory
        if (!fs.existsSync(workpath)) {
            fs.mkdirSync(workpath);
        }

        // create "template" zip file
        const zip = new AdmZip();
        zip.addFile("template.aep", Buffer.from("hello there 1"));
        zip.addFile("(Footage)/test.jpg", Buffer.from("hello there 2"));
        zip.writeZip(path.join(workpath, 'template.zip'));

        // create "asset" zip file
        const zip2 = new AdmZip();
        zip2.addFile("asset.jpg", Buffer.from("hello there 3"));
        zip2.writeZip(path.join(workpath, 'asset.zip'));

        fs.writeFileSync(path.join(workpath, 'non-archive.jpg'), 'hello there 4');
    });

    // Cleanup after tests
    after(function() {
        // Remove created files and directories
        fs.unlinkSync(path.join(workpath, 'template.zip'));
        fs.unlinkSync(path.join(workpath, 'asset.zip'));
        fs.unlinkSync(path.join(workpath, 'template.aep'));
        fs.unlinkSync(path.join(workpath, '(Footage)', 'test.jpg'));
        fs.unlinkSync(path.join(workpath, 'asset.jpg'));
        fs.rmdirSync(path.join(workpath, '(Footage)'));
        fs.unlinkSync(path.join(workpath, 'non-archive.jpg'));

        // Remove test workpath directory
        fs.rmdirSync(workpath);
    });

    it('should extract all files from archives and keep non-archives intact', function(done) {
        const job = {
            workpath: workpath,
            template: {
                dest: path.join(workpath, 'template.zip'),
            },
            assets: [
                {
                    dest: path.join(workpath, 'asset.zip'),
                },
                {
                    dest: path.join(workpath, 'non-archive.jpg'),
                }
            ],
        };

        decompressAction(job, {}, { format: 'zip' }, 'prerender')
            .then(() => {
                // ensure each file is extracted
                assert(fs.existsSync(path.join(workpath, 'template.aep')));
                assert(fs.existsSync(path.join(workpath, '(Footage)', 'test.jpg')));
                assert(fs.existsSync(path.join(workpath, 'asset.jpg')));
                assert(fs.existsSync(path.join(workpath, 'non-archive.jpg')));

                // ensure each file has correct content
                assert.strictEqual(fs.readFileSync(path.join(workpath, 'template.aep'), 'utf8'), 'hello there 1');
                assert.strictEqual(fs.readFileSync(path.join(workpath, '(Footage)', 'test.jpg'), 'utf8'), 'hello there 2');
                assert.strictEqual(fs.readFileSync(path.join(workpath, 'asset.jpg'), 'utf8'), 'hello there 3');
                assert.strictEqual(fs.readFileSync(path.join(workpath, 'non-archive.jpg'), 'utf8'), 'hello there 4');

                done();
            })
            .catch(done);
    });
});
