const fs      = require('fs')
const path    = require('path')
const pkg     = require('./package.json')
const fetch   = require('node-fetch')
const nfp     = require('node-fetch-progress')

const getPath = (ffmpegpath, workpath, name) => {
  if(!path.isAbsolute(ffmpegpath)) ffmpegpath = path.join(workpath, ffmpegpath);
  if(["/", "\\"].indexOf(ffmpegpath.charAt(ffmpegpath.length - 1)) === -1 ) return ffmpegpath;
  else return path.join(ffmpegpath, name);
}

module.exports = (settings, ffmpeg) => {
    return new Promise((resolve, reject) => {
        const {version} = pkg['ffmpeg-static']
        const fileurl = `https://github.com/eugeneware/ffmpeg-static/releases/download/${version}/${process.platform}-x64`
        const filename = `ffmpeg-${version}${process.platform == 'win32' ? '.exe' : ''}`
        let output;

        if(!ffmpeg){
          output = path.join(settings.workpath, filename)
        } else {
          output = getPath(ffmpeg, settings.workpath, filename)
        }

        if (fs.existsSync(output)) {
            settings.logger.log(`> using an existing ffmpeg binary ${version} at: ${output}`)
            return resolve(output)
        }

        settings.logger.log(`> ffmpeg binary ${version} is not found`)
        settings.logger.log(`> downloading a new ffmpeg binary ${version} to: ${output}`)

      const errorHandler = (error) => {
        reject(new Error({
          reason: 'Unable to download file. ' + error.message,
          meta: {fileurl, error}
        }))
 }
        fetch(fileurl)
            .then(res => res.ok ? res : Promise.reject({reason: 'Initial error downloading file', meta: {fileurl, error: res.error}}))
            .then(res => {
                const progress = new nfp(res)

                progress.on('progress', (p) => {
                    process.stdout.write(`${Math.floor(p.progress * 100)}% - ${p.doneh}/${p.totalh} - ${p.rateh} - ${p.etah}\r`)
                })

                const stream = fs.createWriteStream(output)

                res.body
                    .on('error', errorHandler)
                    .pipe(stream)

                stream
                    .on('error', errorHandler)
                    .on('finish', () => {
                        settings.logger.log(`> ffmpeg binary ${version} was successfully downloaded`)
                        fs.chmodSync(output, 0o755)
                        resolve(output)
                    })
            });
    })
}
