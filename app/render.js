// render.js
var spawn = require('child_process').spawn;

module.exports = function(binary, projdata, callback) {

    var aedata = [];
    var ae = spawn(binary, [
        '-project', projdata.project,
        '-comp', projdata.comp,
        '-OMtemplate', projdata.template,
        '-s', '0',
        '-e', projdata.frames,
        '-output', projdata.output
    ]);

    ae.stdout.on('data', function(data) {
        aedata.push(data.toString());
    });

    ae.stderr.on('data', function (data) {  
        aedata.push(data.toString());
    });

    ae.on('close', function (code) {  
        callback((code != 0) ? aedata.join() : null, aedata.join());
    });
};
