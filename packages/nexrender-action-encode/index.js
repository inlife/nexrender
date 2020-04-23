const fs      = require('fs')
const path    = require('path')
const {name}  = require('./package.json')
const {spawn} = require('child_process')

// TODO: make it work
/* make sure pkg will pick up only needed binaries */
const binaries = {
    'darwin': [
        path.join(__dirname, 'node_modules/ffmpeg-static/bin/darwin/x64/ffmpeg'),
        path.join(__dirname, '../../ffmpeg-static/bin/darwin/x64/ffmpeg'),
    ], 
    'win32': [
        path.join(__dirname, 'node_modules/ffmpeg-static/bin/win32/x64/ffmpeg.exe'),
        path.join(__dirname, '../../ffmpeg-static/bin/win32/x64/ffmpeg.exe'),
    ] 
}

// /snapshot/nexrender/packages/nexrender-cli/node_modules/@nexrender/core/node_modules/@nexrender/action-encode/node_modules/ffmpeg-static/bin/darwin/x64/ffmpeg

const getBinary = (job, settings) => {
    return new Promise((resolve, reject) => {
        if (process.pkg) {
            const output = path.join(job.workpath, process.platform == 'win32' ? 'ffmpeg.exe' : 'ffmpeg')

            if (fs.existsSync(output)) {
                return resolve(output);
            }

            const binpath = binaries[process.platform].filter(file => fs.existsSync(file))[0]
            const rd = fs.createReadStream(binpath)              
            const wr = fs.createWriteStream(output)

            const handleError = err => {
                rd.destroy()
                wr.end()
                reject(err)
            }

            rd.on('error', handleError)
            wr.on('error', handleError)

            wr.on('close', () => {
                fs.chmodSync(output, 0o765)
                resolve(output)
            })

            rd.pipe(wr);

        } else {
            const mymodule = 'ffmpeg'; /* prevent pkg from including everything */
            resolve(require(mymodule + '-static').path)
        }
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
