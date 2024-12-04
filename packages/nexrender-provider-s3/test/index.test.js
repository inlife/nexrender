const fs = require('fs')
const path = require('path')
const { download, upload } = require('../src/index')
const { expect } = require('chai')

describe('provider/s3', () => {
    const testJob = { uid: 'test-job' }
    const testSettings = { logger: { log: () => {} } }
    const testFile = path.join(__dirname, 'test.txt')

    before(() => {
        fs.writeFileSync(testFile, 'test content')
    })

    after(() => {
        fs.unlinkSync(testFile)
    })

    describe('download', () => {
        it('should throw error if bucket not provided', async () => {
            try {
                await download(testJob, testSettings, 's3://test.com/key', 'dest.txt', {})
                expect.fail('Should have thrown error')
            } catch (err) {
                expect(err.message).to.include('bucket not provided')
            }
        })

        it('should throw error if key not provided', async () => {
            try {
                await download(testJob, testSettings, 's3://bucket.s3.amazonaws.com/', 'dest.txt', {})
                expect.fail('Should have thrown error')
            } catch (err) {
                expect(err.message).to.include('key not provided')
            }
        })

        it('should handle invalid S3 URIs gracefully', async () => {
            try {
                await download(testJob, testSettings, 'invalid://uri', 'dest.txt', {})
                expect.fail('Should have thrown error')
            } catch (err) {
                expect(err.message).to.include('bucket not provided')
            }
        })

        it('should handle digital ocean spaces URIs', async () => {
            try {
                await download(
                    testJob,
                    testSettings,
                    's3://bucket.nyc3.digitaloceanspaces.com/key',
                    'dest.txt',
                    { endpoint: 'https://nyc3.digitaloceanspaces.com' }
                )
            } catch (err) {
                // Should fail with auth error, not parsing error
                expect(err.message).to.not.include('bucket not provided')
                expect(err.message).to.not.include('key not provided')
            }
        })
    })

    describe('upload', () => {
        it('should throw error if region/endpoint not provided', async () => {
            try {
                await upload(testJob, testSettings, testFile, {})
                expect.fail('Should have thrown error')
            } catch (err) {
                expect(err.message).to.include('region or endpoint not provided')
            }
        })

        it('should throw error if bucket not provided', async () => {
            try {
                await upload(testJob, testSettings, testFile, { region: 'us-east-1' })
                expect.fail('Should have thrown error')
            } catch (err) {
                expect(err.message).to.include('bucket not provided')
            }
        })

        it('should throw error if key not provided', async () => {
            try {
                await upload(testJob, testSettings, testFile, {
                    region: 'us-east-1',
                    bucket: 'test-bucket'
                })
                expect.fail('Should have thrown error')
            } catch (err) {
                expect(err.message).to.include('key not provided')
            }
        })

        it('should handle custom endpoints', async () => {
            const params = {
                endpoint: 'https://custom.endpoint.com',
                bucket: 'test-bucket',
                key: 'test.txt'
            }

            try {
                await upload(testJob, testSettings, testFile, params)
            } catch (err) {
                // Should fail with connection error, not validation error
                expect(err.message).to.not.include('region or endpoint not provided')
            }
        })

        it('should handle additional upload parameters', async () => {
            const params = {
                region: 'us-east-1',
                bucket: 'test-bucket',
                key: 'test.txt',
                contentType: 'application/json',
                acl: 'public-read',
                metadata: { customKey: 'customValue' },
                contentDisposition: 'attachment',
                cacheControl: 'max-age=3600'
            }

            try {
                await upload(testJob, testSettings, testFile, params)
            } catch (err) {
                // Should fail with auth error, not parameter validation
                expect(err.message).to.include('credentials')
            }
        })
    })

    describe('credentials', () => {
        it('should create S3 client with profile credentials', async () => {
            const params = {
                region: 'us-east-1',
                bucket: 'test-bucket',
                key: 'test.txt',
                credentials: {
                    profile: 'test-profile'
                }
            }

            try {
                await upload(testJob, testSettings, testFile, params)
            } catch (err) {
                expect(err.message).to.include('test-profile') // Will fail as profile doesn't exist
            }
        })

        it('should create S3 client with access key credentials', async () => {
            const params = {
                region: 'us-east-1',
                bucket: 'test-bucket',
                key: 'test.txt',
                credentials: {
                    accessKeyId: 'test-key',
                    secretAccessKey: 'test-secret'
                }
            }

            try {
                await upload(testJob, testSettings, testFile, params)
            } catch (err) {
                expect(err.message).to.include('The AWS Access Key Id you provided does not exis')
            }
        })

        it('should handle role-based credentials', async () => {
            const params = {
                region: 'us-east-1',
                bucket: 'test-bucket',
                key: 'test.txt',
                credentials: {
                    RoleArn: 'arn:aws:iam::123456789012:role/test-role',
                    RoleSessionName: 'test-session'
                }
            }

            try {
                await upload(testJob, testSettings, testFile, params)
            } catch (err) {
                expect(err.message).to.include('Resolved credential object is not valid') // Should fail with role-related error
            }
        })

        it('should handle environment variable credentials', async () => {
            // Backup existing env vars
            const originalAccessKey = process.env.AWS_ACCESS_KEY
            const originalSecretKey = process.env.AWS_SECRET_KEY

            // Set test env vars
            process.env.AWS_ACCESS_KEY = 'test-key'
            process.env.AWS_SECRET_KEY = 'test-secret'

            const params = {
                region: 'us-east-1',
                bucket: 'test-bucket',
                key: 'test.txt'
            }

            try {
                await upload(testJob, testSettings, testFile, params)
            } catch (err) {
                expect(err.message).to.include('The AWS Access Key Id you provided does not exist in our records')
            } finally {
                // Restore original env vars
                process.env.AWS_ACCESS_KEY = originalAccessKey
                process.env.AWS_SECRET_KEY = originalSecretKey
            }
        })

        it('should handle AWS_PROFILE environment variable', async () => {
            const originalProfile = process.env.AWS_PROFILE
            process.env.AWS_PROFILE = 'test-profile'

            const params = {
                region: 'us-east-1',
                bucket: 'test-bucket',
                key: 'test.txt'
            }

            try {
                await upload(testJob, testSettings, testFile, params)
            } catch (err) {
                expect(err.message).to.include('profile')
            } finally {
                process.env.AWS_PROFILE = originalProfile
            }
        })
    })
})
