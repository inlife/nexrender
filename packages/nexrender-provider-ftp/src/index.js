var ftp_client = require('ftp');
var fs = require('fs');

  const download = (src, host, port, username, password) => {

      return new Promise((resolve, reject) => {

          var con = new ftp_client();

          const params = {
              host: host,
              port: port,
              user: username,
              password: password
          }


          con.connect(params);

          con.get(src, function(err, stream) {
              if (err) throw err;
              stream.once('close', function() { con.end(); });
              stream.pipe(fs.createWriteStream(src));
            });
      })
  }

  const upload = (src, host, port, username, password) => {
      let file = fs.createReadStream(src);

      return new Promise((resolve, reject) => {

          file.on('error', (err) => {
              reject(err)
              return
          })

          var con = new ftp_client();

          const params = {
              host: host,
              port: port,
              user: username,
              password: password
          }


          con.connect(params);

          con.put(file, src, function(err) {
              if (err) throw err;
              con.end();
          });
      })
  }

  module.exports = {
      upload,
      download
  }
