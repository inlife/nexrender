const fs = require('fs')
var path = require("path");
let Client = require('ssh2-sftp-client');
let sftp = new Client();


const upload = (job, settings, src, params) => {
    if (!params.host) throw new Error('SFTP Host not provided.')
    if (!params.port) throw new Error('SFTP Port not provided.')
    if (!params.user) throw new Error('SFTP Username not provided.')
    if (!params.password) throw new Error('SFTP Password not provided.')

    let file;

    return new Promise((resolve, reject) => {
        // Read file
        try {
            file = fs.createReadStream(src);
        } catch (e) {
            throw new Error('Could not read file. Please check path and permissions.')
        }

        file.on('error', (err) => reject(err))
        const filename = path.basename(src)
        const output = params.output || filename
        delete params.output
        console.log(path.dirname(output));
        sftp.connect({
            host: params.host,
            port: params.port,
            user: params.user,
            password: params.password
        }).then(() => {
            return sftp.exists(path.dirname(output));
        }).then((directoryExists) => {
            if (!directoryExists) return sftp.mkdir(path.dirname(output));
        }).then(() => {
            return sftp.put(src, output);
        }).finally(() => {
            sftp.end();
            resolve();
        }).catch((e) => {
            reject(e);
        });
    })
}

module.exports = {
    upload
}