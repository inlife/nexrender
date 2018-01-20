const api = require('../src');

// Configure api connection
let client = api.create({
    host: "localhost",
    port: 3000,
    secret: 'hhhhhh',
});

// Define project properties
var assets = [{
    type: 'image',
    src: 'https://dl.dropboxusercontent.com/u/28013196/avatar/mario.jpeg',
    name: 'image.jpg'
}];

// // Create project
// client.projects.create({
//     template: 'template1.aepx',
//     composition: 'base',
//     assets: assets
// }).then((project) => {
//     console.log('project saved', project);

//     project.on('rendering', function(err, project) {
//         console.log('project rendering started');
//     });

//     project.on('finished', function(err, project) {
//         console.log('project rendering finished')
//     });

//     project.on('failure', function(err, project) {
//         console.log('project rendering error')
//     });
// }).catch(err => {
//     console.error(err)
// });

// client.projects.create({ template: 'template1.aepx', composition: 'base', assets: assets })

client.projects.get().then(console.log)
// client.projects.update({ id: 'B1uINAxHz', state: 'falled' }).then(console.log).catch(console.log)
// client.projects.remove('SyokVAlSG').then(console.log)
// client.projects.get('SyokVAlSG').catch(console.log)

    // client.projects.remove('S1YN8pxHM').then(console.log).catch(console.log)

// client.projects.get().then(p => {
//     console.log(p)
// }).catch(aa => {
//     console.error(aa)
// })
