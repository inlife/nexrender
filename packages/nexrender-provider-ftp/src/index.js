const fs        = require('fs')
const ftpClient = require('ftp')

const download = (job, settings, src, dest, params) => {
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
        const con = new ftpClient();

        con.connect(params);
        con.get(src, function(err, stream) {
            if (err) throw err;
            stream.once('close', function() { con.end(); });
            stream.pipe(fs.createWriteStream(dest));
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
        const con = new ftpClient();

        file.on('error', (err) => reject(err))

        con.connect(params);
        con.put(file, src, function(err) {
            if (err) throw err;
            con.end();
        });
    })
}

module.exports = {
    upload,
    download,
}
