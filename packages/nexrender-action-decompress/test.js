const assert = require('assert');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const decompressAction = require('./index');
const { describe, it, before, after } = require('mocha');

describe('actions/decompress', function() {
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

        // create "asset with root folder" zip file
        const zip3 = new AdmZip();
        zip3.addFile("root-folder/nested.jpg", Buffer.from("hello there 5"));
        zip3.writeZip(path.join(workpath, 'asset-with-root.zip'));
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
        fs.unlinkSync(path.join(workpath, 'asset-with-root.zip'));
        fs.unlinkSync(path.join(workpath, 'nested.jpg'));

        // Remove test workpath directory
        fs.rmdirSync(workpath);
    });

    it('should extract all files from archives and keep non-archives intact', function(done) {
        const job = {
            workpath: workpath,
            template: {
                dest: path.join(workpath, 'template.zip'),
                decompressed: 'template.aep',
            },
            assets: [
                {
                    dest: path.join(workpath, 'asset.zip'),
                    decompressed: 'asset.jpg',
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

    it('it should extract zip files with 7z', function(done) {
        const job = {
            workpath: workpath,
            template: {
                dest: path.join(workpath, 'template.zip'),
                decompressed: 'template.aep',
            },
            assets: [
                {
                    dest: path.join(workpath, 'asset.zip'),
                    decompressed: 'asset.jpg',
                },
                {
                    dest: path.join(workpath, 'non-archive.jpg'),
                }
            ],
        };

        decompressAction(job, {}, { format: 'zip-7z' }, 'prerender')
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

    it('should update the dest values for each asset to reflect the extracted files', function(done) {
        const job = {
            workpath: workpath,
            template: {
                dest: path.join(workpath, 'template.zip'),
                decompressed: 'template.aep',
            },
            assets: [
                {
                    dest: path.join(workpath, 'asset.zip'),
                    decompressed: 'asset.jpg',
                },
                {
                    dest: path.join(workpath, 'non-archive.jpg'),
                }
            ],
        };

        decompressAction(job, {}, { format: 'zip' }, 'prerender')
            .then(() => {
                // ensure each asset has updated dest value
                assert.strictEqual(job.template.dest, path.join(workpath, 'template.aep'));
                assert.strictEqual(job.assets[0].dest, path.join(workpath, 'asset.jpg'));
                assert.strictEqual(job.assets[1].dest, path.join(workpath, 'non-archive.jpg'));

                done();
            })
            .catch(done);
    });

    it('should handle zip files with a single root folder', function(done) {
        const job = {
            workpath: workpath,
            template: {
                dest: path.join(workpath, 'asset-with-root.zip'),
                decompressed: 'nested.jpg',
            },
            assets: []
        };

        decompressAction(job, {}, { format: 'zip' }, 'prerender')
            .then(() => {
                // ensure file is extracted from nested folder
                assert(fs.existsSync(path.join(workpath, 'nested.jpg')));
                assert.strictEqual(fs.readFileSync(path.join(workpath, 'nested.jpg'), 'utf8'), 'hello there 5');
                assert.strictEqual(job.template.dest, path.join(workpath, 'nested.jpg'));
                done();
            })
            .catch(done);
    });

    it('should automatically flatten zip files with a single root folder', function(done) {
        // Create a zip with a single root folder structure
        const zipWithRoot = new AdmZip();
        zipWithRoot.addFile("root-folder/template2.aep", Buffer.from("nested template"));
        zipWithRoot.addFile("root-folder/assets/image.jpg", Buffer.from("nested image"));
        zipWithRoot.writeZip(path.join(workpath, 'nested-structure.zip'));

        const job = {
            workpath: workpath,
            template: {
                dest: path.join(workpath, 'nested-structure.zip'),
                decompressed: 'template2.aep',
            },
            assets: []
        };

        decompressAction(job, {}, { format: 'zip' }, 'prerender')
            .then(() => {
                // Files should be extracted without the root-folder prefix
                assert(fs.existsSync(path.join(workpath, 'template2.aep')));
                assert(fs.existsSync(path.join(workpath, 'assets', 'image.jpg')));

                // Verify content
                assert.strictEqual(fs.readFileSync(path.join(workpath, 'template2.aep'), 'utf8'), 'nested template');
                assert.strictEqual(fs.readFileSync(path.join(workpath, 'assets', 'image.jpg'), 'utf8'), 'nested image');

                // Verify the root folder itself is not created
                assert(!fs.existsSync(path.join(workpath, 'root-folder')));

                // Cleanup the additional test files
                fs.unlinkSync(path.join(workpath, 'template2.aep'));
                fs.unlinkSync(path.join(workpath, 'assets', 'image.jpg'));
                fs.rmdirSync(path.join(workpath, 'assets'));
                fs.unlinkSync(path.join(workpath, 'nested-structure.zip'));

                done();
            })
            .catch(done);
    });
});
