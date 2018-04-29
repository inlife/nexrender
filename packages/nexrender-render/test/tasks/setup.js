'use strict';

const fs        = require('fs')
const path      = require('path')
const assert    = require('assert')
const exec      = require('child_process').exec

// require module
const setup = require('../../src/tasks/setup.js');

describe('Task: setup', () => {
    const workpath = path.join(__dirname, '..', 'temp')
    const job = {
        uid: 'mytestid',
        template: 'project.aepx',
        files: [{
            type: 'project',
            src: 'somefilename.aepx',
            name: 'project.aepx',
        }]
    }

    const settings = {
        workpath,
        logger: () => {},
    }

    afterEach(() => {
        exec(`rm -r ${workpath}`);
    })

    it('should set job\'s workpath', done => {
        setup(job, settings)
            .then(job => {
                assert(job.workpath == path.join(workpath, 'mytestid'))
                assert(fs.existsSync(job.workpath))

                done()
            })
            .catch(done)
    })
})
