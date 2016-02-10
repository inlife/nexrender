// main
require('dotenv').config();
require('./app/server')(process.env.HTTP_PORT || 3000);

// example
var Project = require('./app/project');

var proj = new Project("project1", "base", {
    image: "https://dl.dropboxusercontent.com/u/28013196/avatar/mario.jpeg",
    track: "https://dl.dropboxusercontent.com/u/28013196/dnb2.mp3"
});

proj.start(function(result) {
    console.log('done:', result);
})
