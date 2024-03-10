const fs = require('fs')
const assert = require('assert').strict;
const patch = require('../src/helpers/patch')

describe('helpers/patch', function() {
    // mock the after effects binary path
    let mockSettings = { logger: { log: () => {} }, trackSync: () => {}, track: () => {} }
    let mockBinaryDir = __dirname + '/patch-test'
    let mockBinaryPath = mockBinaryDir + '/After Effects 2022'
    let mockBinaryFile = mockBinaryPath + '/aerender'
    let mockBinaryScript = mockBinaryPath + '/Scripts/Startup/commandLineRenderer.jsx'
    let mockBackupDir = mockBinaryPath + '/Backup.Scripts/Startup/'
    let mockBinaryPatched = mockBackupDir + 'commandLineRenderer.jsx'

    // prepare after effects binary directory
    fs.mkdirSync(mockBinaryDir, { recursive: true })
    fs.mkdirSync(mockBinaryPath, { recursive: true })
    fs.mkdirSync(mockBinaryPath + '/Scripts', { recursive: true })
    fs.mkdirSync(mockBinaryPath + '/Scripts/Startup', { recursive: true })
    fs.writeFileSync(mockBinaryFile, 'binary')
    fs.writeFileSync(mockBinaryScript, 'original')

    it('should choose the correct patched content for different AE versions', function(done) {
        assert(patch.getContentForPatch('2022/bin').indexOf('in_mfr_enable') !== -1)
        assert(patch.getContentForPatch('2021/bin').indexOf('in_mfr_enable') === -1)
        done()
    })

    it('should correctly return NOT_PATCHED', function(done) {
        assert.strictEqual(patch.getPatchStatus(mockBinaryFile), patch.PATCH_STATUS.NOT_PATCHED)
        done()
    })

    it('should apply the patch correctly', function(done) {
        patch({ binary: mockBinaryFile, ...mockSettings })
        assert.strictEqual(patch.getPatchStatus(mockBinaryFile), patch.PATCH_STATUS.PATCHED)
        assert.strictEqual(fs.readFileSync(mockBinaryScript, 'utf8').indexOf('nexrender-patch-v') !== -1, true)
        // check backup exists
        assert.strictEqual(fs.existsSync(mockBinaryPatched), true)
        assert.strictEqual(fs.readFileSync(mockBinaryPatched, 'utf8').indexOf('nexrender-patch-v') === -1, true)
        done()
    })

    it('should correctly return PATCHED', function(done) {
        assert.strictEqual(patch.getPatchStatus(mockBinaryFile), patch.PATCH_STATUS.PATCHED)
        done()
    })

    it('should correctly return OUTDATED', function(done) {
        fs.writeFileSync(mockBinaryScript, 'nexrender-patch-v0.0.0\n' + fs.readFileSync(mockBinaryScript, 'utf8'))
        assert.strictEqual(patch.getPatchStatus(mockBinaryFile), patch.PATCH_STATUS.OUTDATED)
        done()
    })

    // Cleanup after tests
    after(function() {
        // Remove created files and directories
        fs.unlinkSync(mockBinaryScript)
        fs.unlinkSync(mockBinaryFile)
        fs.rmdirSync(mockBinaryPath + '/Scripts/Startup', { recursive: true })
        fs.rmdirSync(mockBinaryPath + '/Scripts', { recursive: true })
        fs.rmdirSync(mockBinaryPath, { recursive: true })
        fs.rmdirSync(mockBinaryDir, { recursive: true })

    })
});
