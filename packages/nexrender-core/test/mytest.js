module.exports = (job, settings) => {
    console.log('custom module hello world!')
    return Promise.resolve(job)
}

const url = require('url');

console.log(new URL('file:///C:/Documents/resource.txt'))
console.log(new URL('data:text/plain;base64,SGVsbG8sIFdvcmxkIQ%3D%3D'))


console.log(url.parse('file:///C:/Documents/resource.txt'))
console.log(url.parse('data:text/plain;base64,SGVsbG8sIFdvcmxkIQ%3D%3D'))
