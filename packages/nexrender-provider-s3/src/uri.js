const uriS3 = require('amazon-s3-uri')
const url = require('url')

function uriDigitalOcean(src) {
  const parsed = url.parse(src)
  const result = parsed.host.match(/(([^.]+)\.)?([^.]+)\.digitaloceanspaces\.com/)

  if (!result) {
    return {
        uri: parsed,
        region: null,
        bucket: null,
        key: null,
        isPathStyle: false
    }
  }

  const region = result[3]
  let bucket = result[2]
  let key
  let isPathStyle = false

  const pieces = parsed.pathname.split('/')
  if (!bucket) {
    bucket = pieces.slice(1, 2).join('/')
    key = pieces.slice(2, pieces.length).join('/')
    isPathStyle = true
  } else {
    key = pieces.slice(1, pieces.length).join('/')
    isPathStyle = false
  }

  return {
      uri: parsed,
      region,
      bucket,
      key,
      isPathStyle,
  }
}

function uri(src) {
    if (src.indexOf('digitaloceanspaces.com') !== -1) {
      return uriDigitalOcean(src)
    }
    return uriS3(src)
}

module.exports = uri