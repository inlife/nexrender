const { expect } = require('chai')
const uri = require('../src/uri')

describe('provider/s3/uri', () => {
    describe('input validation', () => {
        it('should throw on invalid input', () => {
            expect(() => uri()).to.throw('Invalid URI')
            expect(() => uri('')).to.throw('Invalid URI')
            expect(() => uri(null)).to.throw('Invalid URI')
            expect(() => uri(123)).to.throw('Invalid URI')
        })

        it('should handle malformed URLs gracefully', () => {
            const result = uri('not-a-url')
            expect(result.bucket).to.be.null
            expect(result.key).to.be.null
        })
    })

    describe('digital ocean spaces', () => {
        it('should parse virtual hosted-style URLs', () => {
            const result = uri('https://bucket-name.nyc3.digitaloceanspaces.com/path/to/file.txt')
            expect(result.bucket).to.equal('bucket-name')
            expect(result.region).to.equal('nyc3')
            expect(result.key).to.equal('path/to/file.txt')
            expect(result.isPathStyle).to.be.false
        })

        it('should parse path-style URLs', () => {
            const result = uri('https://nyc3.digitaloceanspaces.com/bucket-name/path/to/file.txt')
            expect(result.bucket).to.equal('bucket-name')
            expect(result.region).to.equal('nyc3')
            expect(result.key).to.equal('path/to/file.txt')
            expect(result.isPathStyle).to.be.true
        })

        it('should handle URLs without keys', () => {
            const result = uri('https://bucket-name.nyc3.digitaloceanspaces.com')
            expect(result.bucket).to.equal('bucket-name')
            expect(result.region).to.equal('nyc3')
            expect(result.key).to.be.null
        })

        it('should handle URLs with empty paths', () => {
            const result = uri('https://bucket-name.nyc3.digitaloceanspaces.com/')
            expect(result.bucket).to.equal('bucket-name')
            expect(result.region).to.equal('nyc3')
            expect(result.key).to.be.null
        })
    })

    describe('s3 urls', () => {
        it('should parse standard S3 URLs', () => {
            const result = uri('s3://my-bucket/path/to/file.txt')
            expect(result.bucket).to.equal('my-bucket')
            expect(result.key).to.equal('path/to/file.txt')
        })

        it('should handle S3 URLs without keys', () => {
            const result = uri('s3://my-bucket')
            expect(result.bucket).to.equal('my-bucket')
            expect(result.key).to.be.null
        })
    })
})
