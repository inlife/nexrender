const assert = require('assert');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const compressAction = require('../src/');
const { describe, it, before, after } = require('mocha');

describe('actions/compress', function() {
    this.timeout(10000);

    const workpath = path.join(__dirname, 'test-workpath');
    const outputZip = path.join(workpath, 'output.zip');

    before(function() {
        if (!fs.existsSync(workpath)) {
            fs.mkdirSync(workpath);
        }
        fs.writeFileSync(path.join(workpath, 'file1.txt'), 'hello there 1');
        fs.writeFileSync(path.join(workpath, 'file2.txt'), 'hello there 2');
        fs.writeFileSync(path.join(workpath, 'test_00001.png'), 'frame 1');
        fs.writeFileSync(path.join(workpath, 'test_00002.png'), 'frame 2');
        fs.writeFileSync(path.join(workpath, 'test_00003.png'), 'frame 3');

        fs.mkdirSync(path.join(workpath, 'folder1'));
        fs.writeFileSync(path.join(workpath, 'folder1', 'file3.txt'), 'hello there 3');

        fs.mkdirSync(path.join(workpath, 'x1'));
        fs.mkdirSync(path.join(workpath, 'x1', 'folder2'));
        fs.mkdirSync(path.join(workpath, 'x1', 'folder2', 'folder3'));
        fs.writeFileSync(path.join(workpath, 'x1', 'folder2', 'folder3', 'test2_00001.png'), 'frame 1');
        fs.writeFileSync(path.join(workpath, 'x1', 'folder2', 'folder3', 'test2_00002.png'), 'frame 2');
        fs.writeFileSync(path.join(workpath, 'x1', 'folder2', 'folder3', 'test2_00003.png'), 'frame 3');
        fs.writeFileSync(path.join(workpath, 'x1', 'folder2', 'some_file.txt'), 'hello there 4');

    });

    after(function() {
        fs.unlinkSync(path.join(workpath, 'file1.txt'));
        fs.unlinkSync(path.join(workpath, 'file2.txt'));
        fs.unlinkSync(path.join(workpath, 'test_00001.png'));
        fs.unlinkSync(path.join(workpath, 'test_00002.png'));
        fs.unlinkSync(path.join(workpath, 'test_00003.png'));
        fs.unlinkSync(path.join(workpath, 'folder1', 'file3.txt'));
        fs.rmdirSync(path.join(workpath, 'folder1'));
        fs.unlinkSync(path.join(workpath, 'x1', 'folder2', 'folder3', 'test2_00001.png'));
        fs.unlinkSync(path.join(workpath, 'x1', 'folder2', 'folder3', 'test2_00002.png'));
        fs.unlinkSync(path.join(workpath, 'x1', 'folder2', 'folder3', 'test2_00003.png'));
        fs.unlinkSync(path.join(workpath, 'x1', 'folder2', 'some_file.txt'));
        fs.rmdirSync(path.join(workpath, 'x1', 'folder2', 'folder3'));
        fs.rmdirSync(path.join(workpath, 'x1', 'folder2'));
        fs.rmdirSync(path.join(workpath, 'x1'));
        if (fs.existsSync(outputZip)) {
            fs.unlinkSync(outputZip);
        }
        fs.rmdirSync(workpath);
    });

    it('should compress specified files and folders into a zip file', async () => {
        const job = {
            uid: 'test-job',
            workpath: workpath,
        };
        const settings = {
            logger: console,
        };
        const params = {
            format: 'zip',
            input: ['file1.txt', 'file2.txt', 'folder1'],
            output: 'output.zip'
        };

        await compressAction(job, settings, params);

        assert(fs.existsSync(outputZip), 'output.zip should be created');

        const zip = new AdmZip(outputZip);
        const zipEntries = zip.getEntries();

        assert.equal(zipEntries.length, 3, 'zip should contain 3 entries');

        const entryNames = zipEntries.map(entry => entry.entryName);
        assert.deepStrictEqual(entryNames.sort(), ['file1.txt', 'file2.txt', 'folder1/file3.txt'].sort(), 'zip should contain correct file names');

        const file1Entry = zip.getEntry('file1.txt');
        assert.strictEqual(file1Entry.getData().toString('utf8'), 'hello there 1');

        const file2Entry = zip.getEntry('file2.txt');
        assert.strictEqual(file2Entry.getData().toString('utf8'), 'hello there 2');

        const file3Entry = zip.getEntry('folder1/file3.txt');
        assert.strictEqual(file3Entry.getData().toString('utf8'), 'hello there 3');
    });

    it('should compress image sequence into a zip file', async () => {
        const job = {
            uid: 'test-job',
            workpath: workpath,
        };
        const settings = {
            logger: console,
        };
        const params = {
            format: 'zip',
            input: ['test_#####.png'],
            output: 'output.zip'
        };

        await compressAction(job, settings, params);

        const zip = new AdmZip(outputZip);
        const zipEntries = zip.getEntries();
        console.log(outputZip);

        assert.equal(zipEntries.length, 3, 'zip should contain 3 entries');

        const entryNames = zipEntries.map(entry => entry.entryName);
        assert.deepStrictEqual(entryNames.sort(), ['test_00001.png', 'test_00002.png', 'test_00003.png'].sort(), 'zip should contain correct file names');
    });

    it('should compress multiple files and folders into a zip file with correct structure', async () => {
        const job = {
            uid: 'test-job',
            workpath: workpath,
        };
        const settings = {
            logger: console,
        };
        const params = {
            format: 'zip',
            input: [
                'x1'
            ],
            output: 'output.zip'
        };

        await compressAction(job, settings, params);

        const zip = new AdmZip(outputZip);
        const zipEntries = zip.getEntries();
        console.log(outputZip);

        assert.equal(zipEntries.length, 6, 'zip should contain 6 entries');

        const entryNames = zipEntries.map(entry => entry.entryName);
        assert.deepStrictEqual(entryNames.sort(), ['x1/folder2/folder3/test2_00001.png', 'x1/folder2/folder3/test2_00002.png', 'x1/folder2/folder3/test2_00003.png', 'x1/folder2/some_file.txt', 'x1/folder2/folder3/', 'x1/folder2/'].sort(), 'zip should contain correct file names');

        const file1Entry = zip.getEntry('x1/folder2/folder3/test2_00001.png');
        assert.strictEqual(file1Entry.getData().toString('utf8'), 'frame 1');

        const file2Entry = zip.getEntry('x1/folder2/folder3/test2_00002.png');
        assert.strictEqual(file2Entry.getData().toString('utf8'), 'frame 2');

        const file3Entry = zip.getEntry('x1/folder2/folder3/test2_00003.png');
        assert.strictEqual(file3Entry.getData().toString('utf8'), 'frame 3');

        const file4Entry = zip.getEntry('x1/folder2/some_file.txt');
        assert.strictEqual(file4Entry.getData().toString('utf8'), 'hello there 4');
    });
});
