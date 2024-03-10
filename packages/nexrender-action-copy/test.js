const fs = require('fs')
const assert = require('assert').strict;
const action = require('./index')

describe('actions/copy', function() {
    let mockJob = {
        output: 'result.mp4',
        workpath: __dirname + '/test/nexrender/',
        uid: 'unique-job-id'
    };
    let mockSettings = {};
    let mockParams = {
        input: 'result.mp4',
        output: __dirname + '/test/custom/output.mp4',
        useJobId: false
    };

    // prepare job output file
    fs.mkdirSync(mockJob.workpath, { recursive: true });
    fs.mkdirSync(__dirname + '/test/custom', { recursive: true });
    fs.writeFileSync(mockJob.workpath + mockJob.output, 'video');

    it('should throw an error if type is not postrender', function(done) {
        assert.throws(() => {
            action(mockJob, mockSettings, mockParams, 'prerender');
        }, Error);
        done();
    });

    it('should use job output if input is not provided', function(done) {
        let params = {...mockParams, input: undefined};
        action(mockJob, mockSettings, params, 'postrender').then((job) => {
            assert.strictEqual(job, mockJob);
            done();
        }).catch(done);
    });

    it('should resolve with the job object on success', function(done) {
        action(mockJob, mockSettings, mockParams, 'postrender').then((job) => {
            assert.strictEqual(job, mockJob);
            done();
        }).catch(done);
    });

    it('should create necessary directories for output', function(done) {
        let params = {...mockParams, output: __dirname + '/test/custom/newdir/output.mp4'};
        action(mockJob, mockSettings, params, 'postrender').then(() => {
            assert.ok(fs.existsSync(__dirname + '/test/custom/newdir/'));
            fs.unlinkSync(__dirname + '/test/custom/newdir/output.mp4');
            fs.rmdirSync(__dirname + '/test/custom/newdir');
            done();
        }).catch(done);
    });

    it('should append jobId to filename if useJobId is true', function(done) {
        let params = {useJobId: true, output: __dirname + '/test/custom/'};
        action(mockJob, mockSettings, params, 'postrender').then(() => {
            let expectedOutputPath = __dirname + '/test/custom/' + mockJob.uid + '.mp4';
            assert.ok(fs.existsSync(expectedOutputPath));
            done();
        }).catch(done);
    });

    it('should handle read or write stream errors', function(done) {
        let params = {...mockParams, input: 'nonexistent.mp4'};
        action(mockJob, mockSettings, params, 'postrender').then(() => {
            done(new Error('Promise should not have resolved'));
        }).catch((error) => {
            assert.ok(error instanceof Error);
            done();
        });
    });

    after(function() {
        fs.unlinkSync(mockJob.workpath + mockJob.output);
        fs.rmdirSync(mockJob.workpath);
        fs.unlinkSync(__dirname + '/test/custom/output.mp4');
        fs.unlinkSync(__dirname + '/test/custom/' + mockJob.uid + '.mp4');
        fs.rmdirSync(__dirname + '/test/custom');
        fs.rmdirSync(__dirname + '/test');
    });
});
