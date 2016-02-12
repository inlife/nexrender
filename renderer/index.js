'use strict';

const Project = require('./modules/project');

// class Renderer {
//     render() {

//     }
// }

// module.exports = new Renderer;

let proj = new Project({
    template: "template1",
    composition: "comp1",
    assets: [{
        type: "image",
        src: "https://dl.dropboxusercontent.com/u/28013196/avatar/mario.jpeg",
        name: "thumn1.jpg", // name of file to save content to
        filters: [{
            name: "cover",
            params: [{
                width: 1280,
                height: 720
            }]
        }, {
            name: "grayscale",
            params: [{
                power: 10
            }]  
        }]
    }, {
        type: "audio",
        src: "https://dl.dropboxusercontent.com/u/28013196/dnb2.mp3",
        name: "audio.mp3"
    }, {
        type: "data",
        src: "https://dl.dropboxusercontent.com/u/28013196/data.json",
        name: "data.json"
    }],
    postActions: [{ // or "plugins"
        name: "youtube-upload",
        params: [{
            profile: "inlife-youtube", // predefined account record with auth keys etc.
            title: "test",
            description: "description",
            keywords: "keywords",
            category: "music",
            privacy: "public",
        }]
    }, {
        name: "email-notification",
        params: [{
            emails: ["test@test.com", "test2@test.com"]
        }]
    }]
});
console.log(proj);