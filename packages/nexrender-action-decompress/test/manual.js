const assert = require('assert');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const decompressAction = require('../index');

// create "template" zip file
const zip = new AdmZip();
zip.addFile("template.aep", new Buffer.from("hello there 1"));
zip.addFile("(Footage)/test.jpg", new Buffer.from("hello there 2"));
zip.writeZip(path.join(__dirname, 'template.zip'));

// create "asset" zip file
const zip2 = new AdmZip();
zip2.addFile("asset.jpg", new Buffer.from("hello there 3"));
zip2.writeZip(path.join(__dirname, 'asset.zip'));

fs.writeFileSync(path.join(__dirname, 'non-archive.jpg'), 'hello there 4');

// create job and test with the action
const job = {
    workpath: __dirname,
    template: {
        dest: path.join(__dirname, 'template.zip'),
    },
    assets: [
        {
            dest: path.join(__dirname, 'asset.zip'),
        },
        {
            dest: path.join(__dirname, 'non-archive.jpg'),
        }
    ],
};

decompressAction(job, {}, { format: 'zip' }, 'prerender')
    .then(() => {
        // ensure each file is extracted
        assert(fs.existsSync(path.join(__dirname, 'template.aep')));
        assert(fs.existsSync(path.join(__dirname, '(Footage)', 'test.jpg')));
        assert(fs.existsSync(path.join(__dirname, 'asset.jpg')));
        assert(fs.existsSync(path.join(__dirname, 'non-archive.jpg')));

        // ensure each file has correct content
        assert.equal(fs.readFileSync(path.join(__dirname, 'template.aep'), 'utf8'), 'hello there 1');
        assert.equal(fs.readFileSync(path.join(__dirname, '(Footage)', 'test.jpg'), 'utf8'), 'hello there 2');
        assert.equal(fs.readFileSync(path.join(__dirname, 'asset.jpg'), 'utf8'), 'hello there 3');
        assert.equal(fs.readFileSync(path.join(__dirname, 'non-archive.jpg'), 'utf8'), 'hello there 4');

        // cleanup
        fs.unlinkSync(path.join(__dirname, 'template.zip'));
        fs.unlinkSync(path.join(__dirname, 'asset.zip'));
        fs.unlinkSync(path.join(__dirname, 'template.aep'));
        fs.unlinkSync(path.join(__dirname, '(Footage)', 'test.jpg'));
        fs.unlinkSync(path.join(__dirname, 'asset.jpg'));
        fs.rmdirSync(path.join(__dirname, '(Footage)'));
        fs.unlinkSync(path.join(__dirname, 'non-archive.jpg'));

        console.log('All tests passed');
    })
    .catch((err) => {
        console.error(err);
    });
