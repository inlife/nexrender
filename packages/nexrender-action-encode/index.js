const fs      = require('fs')
const path    = require('path')
const pkg     = require('./package.json')
const fetch   = require('node-fetch')
const {spawn} = require('child_process')
const nfp     = require('node-fetch-progress')

const getBinary = (job, settings) => {
    return new Promise((resolve, reject) => {
        const {version} = pkg['ffmpeg-static']
        const filename = `ffmpeg-${version}${process.platform == 'win32' ? '.exe' : ''}`
        const fileurl = `https://github.com/eugeneware/ffmpeg-static/releases/download/${version}/${process.platform}-x64`
        const output = path.join(settings.workpath, filename)

        if (fs.existsSync(process.env.NEXRENDER_FFMPEG)) {
            settings.logger.log(`> using external ffmpeg binary at: ${process.env.NEXRENDER_FFMPEG}`)
            return resolve(process.env.NEXRENDER_FFMPEG)
        }

        if (fs.existsSync(output)) {
            settings.logger.log(`> using an existing ffmpeg binary ${version} at: ${output}`)
            return resolve(output)
        }

        settings.logger.log(`> ffmpeg binary ${version} is not found`)
        settings.logger.log(`> downloading a new ffmpeg binary ${version} to: ${output}`)

        const errorHandler = (error) => reject(new Error({
            reason: 'Unable to download file',
            meta: {fileurl, error}
        }))


        fetch(fileurl)
            .then(res => res.ok ? res : Promise.reject({reason: 'Initial error downloading file', meta: {fileurl, error: res.error}}))
            .then(res => {
                const progress = new nfp(res)

                progress.on('progress', (p) => {
                    process.stdout.write(`${Math.floor(p.progress * 100)}% - ${p.doneh}/${p.totalh} - ${p.rateh} - ${p.etah}                       \r`)
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

/* pars of snippet taken from https://github.com/xonecas/ffmpeg-node/blob/master/ffmpeg-node.js#L136 */
const constructParams = (job, settings, { preset, input, output, params }) => {
    input = input || job.output;

    if (!path.isAbsolute(input)) input = path.join(job.workpath, input);
    if (!path.isAbsolute(output)) output = path.join(job.workpath, output);

    settings.logger.log(`[${job.uid}] action-encode: input file ${input}`)
    settings.logger.log(`[${job.uid}] action-encode: output file ${output}`)

    switch(preset) {
        case 'mp4':
            params = Object.assign({}, {
                '-i': input,
                '-acodec': 'aac',
                '-ab': '128k',
                '-ar': '44100',
                '-vcodec': 'libx264',
                '-r': '25',
                '-pix_fmt' : 'yuv420p',
            }, params, {
              '-y': output
            });
        break;

        case 'ogg':
            params = Object.assign({}, {
                '-i': input,
                '-acodec': 'libvorbis',
                '-ab': '128k',
                '-ar': '44100',
                '-vcodec': 'libtheora',
                '-r': '25',
            }, params, {
                '-y': output
            });
        break;

        case 'webm':
            params = Object.assign({}, {
                '-i': input,
                '-acodec': 'libvorbis',
                '-ab': '128k',
                '-ar': '44100',
                '-vcodec': 'libvpx',
                '-b': '614400',
                '-aspect': '16:9',
            }, params, {
                '-y': output
            });
        break;

        case 'mp3':
            params = Object.assign({}, {
                '-i': input,
                '-acodec': 'libmp3lame',
                '-ab': '128k',
                '-ar': '44100',
            }, params, {
                '-y': output
            });
        break;

        case 'm4a':
            params = Object.assign({}, {
                '-i': input,
                '-acodec': 'aac',
                '-ab': '64k',
                '-ar': '44100',
                '-strict': '-2',
            }, params, {
                '-y': output
            });
        break;

        case 'gif':
            params = Object.assign({}, {
                '-i': input,
                '-ss': '61.0',
                '-t': '2.5',
                '-filter_complex': `[0:v] fps=12,scale=480:-1,split [a][b];[a] palettegen [p];[b][p] paletteuse`,
            }, params, {
                '-y': output
            });
        break;

        default:
            params = Object.assign({}, {
                '-i': input
            }, params, {
                '-y': output
            });
        break;
    }

    /* convert to plain array */
    return Object.keys(params).reduce(
        (cur, key) => cur.concat(key, params[key]), []
    );
}

module.exports = (job, settings, options, type) => {
    settings.logger.log(`[${job.uid}] starting action-encode action (ffmpeg)`)

    return new Promise((resolve, reject) => {
        const params = constructParams(job, settings, options);
        const binary = getBinary(job, settings).then(binary => {
            const instance = spawn(binary, params);

            instance.on('error', err => reject(new Error(`Error starting ffmpeg process: ${err}`)));
            instance.stderr.on('data', (data) => settings.logger.log(`[${job.uid}] ${data.toString()}`));
            instance.stdout.on('data', (data) => settings.debug && settings.logger.log(`[${job.uid}] ${data.toString()}`));

            /* on finish (code 0 - success, other - error) */
            instance.on('close', (code) => {
                if (code !== 0) {
                    return reject(new Error('Error in action-encode module (ffmpeg) code : ' + code))
                }

                resolve(job)
            });
        }).catch(e => {
            return reject(new Error('Error in action-encode module (ffmpeg) ' + e))
        });
    });
}
