const uriS3 = require('amazon-s3-uri')
const { URL } = require('url')

const DIGITAL_OCEAN_REGEX = /^(?:([^.]+)\.)?([^.]+)\.digitaloceanspaces\.com$/

/**
 * Parse Digital Ocean Spaces URI
 * @param {string} src URI string
 * @returns {Object} Parsed URI object
 */
function uriDigitalOcean(src) {
    try {
        const url = new URL(src)
        const match = url.hostname.match(DIGITAL_OCEAN_REGEX)

        if (!match) {
            return {
                uri: url,
                region: null,
                bucket: null,
                key: null,
                isPathStyle: false
            }
        }

        const [, subdomain, region] = match
        const pathParts = url.pathname.slice(1).split('/') // Remove leading slash

        // Handle path-style vs virtual hosted-style URLs
        const isPathStyle = !subdomain
        const bucket = isPathStyle ? pathParts[0] : subdomain
        const key = isPathStyle ? pathParts.slice(1).join('/') : pathParts.join('/')

        return {
            uri: url,
            region,
            bucket,
            key: key || null, // Ensure key is null if empty
            isPathStyle
        }
    } catch (err) {
        // Return empty result on invalid URLs
        return {
            uri: null,
            region: null,
            bucket: null,
            key: null,
            isPathStyle: false
        }
    }
}

/**
 * Parse S3 or Digital Ocean Spaces URI
 * @param {string} src URI string
 * @returns {Object} Parsed URI object
 */
function uri(src) {
    if (!src || typeof src !== 'string') {
        throw new Error('Invalid URI: source must be a non-empty string')
    }

    // Normalize URI before parsing
    const normalizedSrc = src.trim()

    if (normalizedSrc.includes('digitaloceanspaces.com')) {
        return uriDigitalOcean(normalizedSrc)
    }

    try {
        return uriS3(normalizedSrc)
    } catch (err) {
        // Return consistent error format
        return {
            uri: null,
            bucket: null,
            key: null,
            isPathStyle: false
        }
    }
}

module.exports = uri
