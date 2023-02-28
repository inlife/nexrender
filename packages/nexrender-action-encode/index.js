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
            .then(res => res.ok ? res : Promise.reject(new Error({
                reason: 'Initial error downloading file',
                meta: {fileurl, error: res.error}
            })))
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
                    .on('close', () => {
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

    if (!path.isAbsolute(output)) output = path.join(job.workpath, output);

    let inputs = [input];

    if (params && params.hasOwnProperty('-i')) {
        const p = params['-i'];

        if (Array.isArray(p)) {
            inputs.push(...p);
        } else {
            inputs.push(p);
        }

        delete params['-i'];
    }

    inputs = inputs.map(i => {
        if (path.isAbsolute(i)) return i;
        return path.join(job.workpath, i);
    });

    settings.logger.log(`[${job.uid}] action-encode: input file ${inputs[0]}`)
    settings.logger.log(`[${job.uid}] action-encode: output file ${output}`)

    const baseParams = {
        '-i': inputs,
        '-ab': '128k',
        '-ar': '44100',
    };

    switch(preset) {
        case 'mp4':
            params = Object.assign(baseParams, {
                '-acodec': 'aac',
                '-vcodec': 'libx264',
                '-pix_fmt' : 'yuv420p',
                '-r': '25',
            }, params, {
              '-y': output
            });
        break;

        case 'ogg':
            params = Object.assign(baseParams, {
                '-acodec': 'libvorbis',
                '-vcodec': 'libtheora',
                '-r': '25',
            }, params, {
                '-y': output
            });
        break;

        case 'webm':
            params = Object.assign(baseParams, {
                '-acodec': 'libvorbis',
                '-vcodec': 'libvpx',
                '-b': '614400',
                '-aspect': '16:9',
            }, params, {
                '-y': output
            });
        break;

        case 'mp3':
            params = Object.assign(baseParams, {
                '-acodec': 'libmp3lame',
            }, params, {
                '-y': output
            });
        break;

        case 'm4a':
            params = Object.assign(baseParams, {
                '-acodec': 'aac',
                '-ab': '64k',
                '-strict': '-2',
            }, params, {
                '-y': output
            });
        break;

        case 'gif':
            params = Object.assign({}, {
                '-i': inputs,
                '-ss': '61.0',
                '-t': '2.5',
                '-filter_complex': `[0:v] fps=12,scale=480:-1,split [a][b];[a] palettegen [p];[b][p] paletteuse`,
            }, params, {
                '-y': output
            });
        break;

        default:
            params = Object.assign({}, {
                '-i': inputs
            }, params, {
                '-y': output
            });
        break;
    }

    /* convert to plain array */
    return Object.keys(params).reduce(
        (cur, key) => {
            const value = params[key];
            if (Array.isArray(value)) {
                value.forEach(item => cur.push(key, item.replace('${workPath}', job.workpath)));
            } else {
                cur.push(key, String(value).replace('${workPath}', job.workpath))
            }
            return cur;
        }, []
    );
}

const convertToMilliseconds = (h, m, s) => ((h*60*60+m*60+s)*1000);

const getDuration = (regex, data) => {
    const matches = data.match(regex);

    if (matches) {
        return convertToMilliseconds(parseInt(matches[1]), parseInt(matches[2]), parseInt(matches[3]));
    }

    return 0;
}

module.exports = (job, settings, options/*, type */) => {
    settings.logger.log(`[${job.uid}] starting action-encode action (ffmpeg)`)

    return new Promise((resolve, reject) => {
        const params = constructParams(job, settings, options);
        getBinary(job, settings).then(binary => {
            if (settings.debug) {
                settings.logger.log(`[${job.uid}] spawning ffmpeg process: ${binary} ${params.join(' ')}`);
            }
            const instance = spawn(binary, params, {windowsHide: true});
            let totalDuration = 0

            instance.on('error', err => reject(new Error(`Error starting ffmpeg process: ${err}`)));
            instance.stderr.on('data', (data) => {
                const dataString = data.toString();

                settings.logger.log(`[${job.uid}] ${dataString}`);

                if (totalDuration === 0) {
                    totalDuration = getDuration(/(\d+):(\d+):(\d+).(\d+), start:/, dataString);
                }

                let currentProgress = getDuration(/time=(\d+):(\d+):(\d+).(\d+) bitrate=/, dataString);

                if (totalDuration > 0 && currentProgress > 0) {
                    const currentPercentage = Math.ceil(currentProgress / totalDuration * 100);

                    if (options.hasOwnProperty('onProgress') && typeof options['onProgress'] == 'function') {
                        options.onProgress(job, currentPercentage);
                    }

                    settings.logger.log(`[${job.uid}] encoding progress ${currentPercentage}%...`);
                }
            });

            instance.stdout.on('data', (data) => settings.debug && settings.logger.log(`[${job.uid}] ${data.toString()}`));

            /* on finish (code 0 - success, other - error) */
            instance.on('close', (code) => {
                if (code !== 0) {
                    return reject(new Error('Error in action-encode module (ffmpeg) code : ' + code))
                }

                if (options.hasOwnProperty('onComplete') && typeof options['onComplete'] == 'function') {
                    options.onComplete(job);
                }

                resolve(job)
            });
        }).catch(e => {
            return reject(new Error('Error in action-encode module (ffmpeg) ' + e))
        });
    });
}
