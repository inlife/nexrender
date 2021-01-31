const fs  = require('fs')
const url = require('url')
const FTP = require('ftp')
var path = require("path");


const download = (job, settings, src, dest, params) => {
    let parsed = global.URL ? new URL(src) : url.parse(src)

    params.host = parsed.hostname || parsed.host || 'localhost';
    params.port = parseInt(parsed.port, 10) || 21;
    params.user = parsed.username;
    params.password = parsed.password;

    return new Promise((resolve, reject) => {
        const connection = new FTP();
        const filepath   = parsed.pathname;

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
    if (!params.host) throw new Error('FTP Host not provided.')
    if (!params.port) throw new Error('FTP Port not provided.')
    if (!params.user) throw new Error('FTP Username not provided.')
    if (!params.password) throw new Error('FTP Password not provided.')

    let file;
    let con;

    return new Promise((resolve, reject) => {
        // Read file
        try {
            file = fs.createReadStream(src);
        }
        catch(e) {
            throw new Error('Cloud not read file, Please check path and permissions.')
        }

        file.on('error', (err) => reject(err))
        const filename = path.basename(src)
        const output = params.output || filename
        delete params.output

        // Connect to FTP Server
        try {
            con = new FTP();
            con.connect(params);
        }
        catch(e) {
            throw new Error('Cloud not connect to FTP Server, Please check Host and Port.')
        }

        con.on("ready", () => {
            // Put file
            try {
                con.put(file, output, function(err) {
                    if (err) {
                        con.end()
                        reject(err)

                        return;
                    }

                    con.end()
                    resolve()
                });
            }
            catch(e){
                con.end()
                throw new Error('Cloud not upload file, Please make sure FTP user has write permissions.')
            }
        })
    })
}

module.exports = {
    upload,
    download,
}
