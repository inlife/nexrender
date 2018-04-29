'use strict';

const api = require('../src');

// Configure api connection
let client = api.create({
    host: "localhost",
    port: 3000,
    secret: 'hhhhhh',
});

// Define job properties
var files = [{
    type: 'image',
    src: 'https://dl.dropboxusercontent.com/u/28013196/avatar/mario.jpeg',
    name: 'image.jpg'
}];

// // Create job
// client.jobs.create({
//     template: 'template1.aepx',
//     composition: 'base',
//     files: files
// }).then((job) => {
//     console.log('job saved', job);

//     job.on('rendering', function(err, job) {
//         console.log('job rendering started');
//     });

//     job.on('finished', function(err, job) {
//         console.log('job rendering finished')
//     });

//     job.on('failure', function(err, job) {
//         console.log('job rendering error')
//     });
// }).catch(err => {
//     console.error(err)
// });

// client.jobs.create({ template: 'template1.aepx', composition: 'base', files: files })

client.jobs.get().then(console.log)
// client.jobs.update({ id: 'B1uINAxHz', state: 'falled' }).then(console.log).catch(console.log)
// client.jobs.remove('SyokVAlSG').then(console.log)
// client.jobs.get('SyokVAlSG').catch(console.log)

    // client.jobs.remove('S1YN8pxHM').then(console.log).catch(console.log)

// client.jobs.get().then(p => {
//     console.log(p)
// }).catch(aa => {
//     console.error(aa)
// })
