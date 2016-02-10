var express = require('express');

var app = express();

app.get('/', function (req, res) {
    res.send('Hello World!');
});

module.exports = function(port) {
    app.listen(port, function () {
        // console.log('rest api server started');
    });
};
