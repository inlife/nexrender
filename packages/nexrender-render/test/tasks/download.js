'use strict';

const fs        = require('fs')
const url       = require('url')
const http      = require('http')
const path      = require('path')
const exec      = require('child_process').exec
const assert    = require('assert')

// require module
const download = require('../../src/tasks/download.js');

describe('Task: download', () => {
    const settings = {
        logger: () => {},
    }

    describe('remote file via http(s)', () => {
        // simple http static server
        const server = http.createServer((req, res) => {
            let uri         = url.parse(req.url).pathname;
            let filename    = path.join(__dirname, '..', 'res', uri);

            fs.exists(filename, (exists) => {
                if (!exists) {
                    res.writeHead(404, {"Content-Type": "text/plain"});
                    res.write("404 Not Found\n");
                    return res.end();
                }

                fs.readFile(filename, "binary", function(err, file) {
                    if (err) {
                        res.writeHead(500, {"Content-Type": "text/plain"});
                        res.write(err + "\n");
                        return res.end();
                    }

                    // send 200
                    res.writeHead(200);
                    res.write(file, "binary");
                    return res.end();
                });
            });
        })

        let job = {
            uid: 'mytestid',
            template: 'proj.aepx',
            workpath: path.join(__dirname, '..'),
            files: [{
                type: 'project',
                src: 'http://localhost:3322/project.aepx',
                name: 'proj.aepx'
            }, {
                type: 'image',
                src: 'http://localhost:3322/img.jpg',
                provider: 'http',
            }],
        }

        before(done => {
            server.listen(3322, done)
        })

        after(() => {
            server.close()
        })

        it('should download each asset', (done) => {
            download(job, settings)
                .then(prj => {
                    const file1 = path.join(__dirname, '..', 'proj.aepx')
                    const file2 = path.join(__dirname, '..', 'img.jpg')

                    assert(fs.existsSync(file1))
                    assert(fs.existsSync(file2))

                    fs.unlinkSync(file1)
                    fs.unlinkSync(file2)

                    done()
                })
                .catch(done)
        })
    })

    describe('local file', () => {
        let job = {
            uid: 'mytestid',
            template: 'proj.aepx',
            workpath: path.join(__dirname, '..'),
            files: [{
                type: 'project',
                src: path.join(__dirname, '..', 'res', 'project.aepx'),
                name: 'proj.aepx'
            }, {
                type: 'image',
                src: path.join(__dirname, '..', 'res', 'img.jpg'),
            }],
        }

        it('should copy each asset', (done) => {
            download(job, settings)
                .then(prj => {
                    const file1 = path.join(__dirname, '..', 'proj.aepx')
                    const file2 = path.join(__dirname, '..', 'img.jpg')

                    assert(fs.existsSync(file1))
                    assert(fs.existsSync(file2))

                    fs.unlinkSync(file1)
                    fs.unlinkSync(file2)

                    done()
                })
                .catch(done)
        })
    })
})
