const fs  = require('fs')
const url = require('url')
const FTP = require('ftp')

const download = (job, settings, src, dest, params) => {
    let parsed = global.URL ? new URL(asset.src) : url.parse(src)

    params.host = parsed.hostname || parsed.host || 'localhost';
    params.port = parseInt(parsed.port, 10) || 21;
    params.user = parsed.username;
    params.password = parsed.password;

    return new Promise((resolve, reject) => {
        const connection = new FTP();
        const filepath   = uri.pathname;

        connection.connect(params);
        connection.get(filepath, function(err, stream) {
            if (err) return reject(err)

            stream.once('close', function() { connection.end(); });
            stream.pipe(fs.createWriteStream(dest));

            resolve()
        });
    })
}

const upload = (job, settings, src, params) => {
    if (!params.host) {
        throw new Error('FTP Host not provided.')
    }
    if (!params.port) {
        throw new Error('FTP Port not provided.')
    }
    if (!params.user) {
        throw new Error('FTP Username not provided.')
    }
    if (!params.password) {
        throw new Error('FTP Password not provided.')
    }

    return new Promise((resolve, reject) => {
        const file = fs.createReadStream(src);
        const con = new FTP();

        file.on('error', (err) => reject(err))

        con.connect(params);
        var filename = src.replace(/^.*[\\\/]/, '')
        con.put(file, filename, function(err) {
            if (err) return reject(err)

            con.end()
            resolve()
        });
    })
}

module.exports = {
    upload,
    download,
}
