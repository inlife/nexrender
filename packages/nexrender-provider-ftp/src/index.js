const fs  = require('fs')
const url = require('url')
const FTP = require('ftp')
var path = require("path");


const download = (job, settings, src, dest, params) => {
    let parsed = global.URL ? new URL(asset.src) : url.parse(src)

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

        // Read file
        try{
            const file = fs.createReadStream(src);
        }
        catch(e){
            throw new Error('Cloud not read file, Please check path and permissions.')
        }
        file.on('error', (err) => reject(err))
        var filename = path.basename(src)
        
        // Connect to FTP Server
        try{
            const con = new FTP();
            con.connect(params);
        }
        catch(e){
            throw new Error('Cloud not connect to FTP Server, Please check Host and Port.')
        }
        
        // Put file 
        try{
            con.put(file, filename, function(err) {
                if (err) return reject(err)
    
                con.end()
                resolve()
            });
        }
        catch(e){
            throw new Error('Cloud not upload file, Please make sure FTP user has write permissions.')
            con.end()
        }
    
    })
}

module.exports = {
    upload,
    download,
}
