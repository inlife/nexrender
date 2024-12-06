const path = require('path')
const fs = require('fs/promises')
const {existsSync} = require('fs')
const assert = require('assert').strict
const cacheAction = require('../index.js')

describe('action/cache', function() {
    const workpath = path.join(__dirname, 'workpath')
    const cacheDirectory = path.join(__dirname, 'test-cache')
    const ttl = 1000

    const mockJob = {
        workpath: workpath,
        template: {
            src: 'http://example.com/test.aep'
        },
        assets: [
            {
                src: 'https://example.com/assets/image.jpg',
                type: 'image',
                layerName: 'MyNicePicture.jpg'
            }
        ]
    }

    const mockSettings = {
        logger: {
            log: () => {} // silent logger for tests
        }
    }

    beforeEach(async () => {
        // Create fresh directories for each test
        await fs.mkdir(cacheDirectory, { recursive: true })
        await fs.mkdir(workpath, { recursive: true })
    })

    afterEach(async () => {
        // Cleanup after each test
        await fs.rm(cacheDirectory, { recursive: true, force: true })
        await fs.rm(workpath, { recursive: true, force: true })
    })

    describe('predownload phase', () => {
        it('should update job with cached file paths', async () => {
            // Prepare cached files
            await fs.writeFile(path.join(cacheDirectory, 'test.aep'), 'Some content')
            await fs.writeFile(path.join(cacheDirectory, 'image.jpg'), 'Not an image')

            const job = JSON.parse(JSON.stringify(mockJob)) // Deep clone job
            await cacheAction(job, mockSettings, {
                cacheDirectory,
                ttl,
                cacheAssets: true
            }, 'predownload')

            // Verify job was updated with cached file paths
            assert.equal(
                job.template.src,
                `file://${path.join(cacheDirectory, 'test.aep')}`
            )
            assert.deepEqual(job.assets, [{
                src: `file://${path.join(cacheDirectory, 'image.jpg')}`,
                type: 'image',
                layerName: 'MyNicePicture.jpg'
            }])
        })
    })

    describe('postdownload phase', () => {
        it('should save files to cache directory', async () => {
            const job = JSON.parse(JSON.stringify(mockJob)) // Deep clone job

            // Prepare "rendered" files
            await fs.writeFile(path.join(workpath, 'test.aep'), 'Some content')
            await fs.writeFile(path.join(workpath, 'image.jpg'), 'Not an image')

            await cacheAction(job, mockSettings, {
                cacheDirectory,
                ttl,
                cacheAssets: true
            }, 'postdownload')

            // Verify files were cached
            assert(existsSync(path.join(cacheDirectory, 'test.aep')))
            assert(existsSync(path.join(cacheDirectory, 'image.jpg')))
        })
    })

    describe('error cases', () => {
        it('should throw error if cacheDirectory not provided', () => {
            assert.throws(
                () => cacheAction(mockJob, mockSettings, {}, 'predownload'),
                {
                    message: 'cacheDirectory not provided.'
                }
            )
        })

        it('should throw error if cache path exists but is not a directory', async () => {
            // First remove the directory created by beforeEach
            await fs.rm(cacheDirectory, { recursive: true, force: true })

            // Create a file instead of directory
            await fs.writeFile(cacheDirectory, '')

            assert.throws(
                () => cacheAction(mockJob, mockSettings, { cacheDirectory }, 'predownload'),
                {
                    message: 'Cache path of ' + cacheDirectory + ' exists but is not a directory, stopping'
                }
            )
        })
    })

    describe('special cases', () => {
        it('should skip caching assets when cacheAssets is false', async () => {
            await fs.writeFile(path.join(workpath, 'test.aep'), 'Template')
            await fs.writeFile(path.join(workpath, 'image.jpg'), 'Image')

            await cacheAction(mockJob, mockSettings, {
                cacheDirectory,
                cacheAssets: false
            }, 'postdownload')

            // Only template should be cached
            assert(existsSync(path.join(cacheDirectory, 'test.aep')))
            assert(!existsSync(path.join(cacheDirectory, 'image.jpg')))
        })

        it('should skip caching for local file protocol sources', async () => {
            // Prepare workpath files first
            await fs.writeFile(path.join(workpath, 'test.aep'), 'Template')
            await fs.writeFile(path.join(workpath, 'image.jpg'), 'Image')

            const localJob = {
                ...mockJob,
                template: {
                    src: 'file:///local/test.aep',
                    dest: path.join(workpath, 'test.aep')
                },
                assets: [{
                    ...mockJob.assets[0],
                    src: 'file:///local/image.jpg',
                    dest: path.join(workpath, 'image.jpg')
                }]
            }

            await cacheAction(localJob, mockSettings, {
                cacheDirectory,
                cacheAssets: true
            }, 'postdownload')

            // Nothing should be cached for local files
            assert(!existsSync(path.join(cacheDirectory, 'test.aep')))
            assert(!existsSync(path.join(cacheDirectory, 'image.jpg')))
        })
    })
})
