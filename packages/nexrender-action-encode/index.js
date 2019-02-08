const fs      = require('fs')
const path    = require('path')
const {name}  = require('./package.json')
const {spawn} = require('child_process')

/* make sure pkg will pick up only needed binaries */
const macos = path.join(__dirname, 'node_modules/ffmpeg-static/bin/darwin/x64/ffmpeg');
const win32 = path.join(__dirname, 'node_modules/ffmpeg-static/bin/win32/x64/ffmpeg.exe');

/* pars of snippet taken from https://github.com/xonecas/ffmpeg-node/blob/master/ffmpeg-node.js#L136 */
const constructParams = (job, settings, { preset, input, output, params }) => {
    const file = input ? path.join(job.workpath, input) : job.output;

    if (!path.isAbsolute(output)) {
        output = path.join(job.workpath, output);
    }

    settings.logger.log(`[${job.uid}] action-encode: input file ${file}`)
    settings.logger.log(`[${job.uid}] action-encode: output file ${output}`)

    switch(preset) {
        case 'mp4':
            params = Object.assign({}, {
                '-i': file,
                '-acodec': 'aac',
                '-ab': '128k',
                '-ar': '44100',
                '-vcodec': 'libx264',
                '-r': '25',
                '-y': output
            }, params);
        break;

        case 'ogg':
            params = Object.assign({}, {
                '-i': file,
                '-acodec': 'libvorbis',
                '-ab': '128k',
                '-ar': '44100',
                '-vcodec': 'libtheora',
                '-r': '25',
                '-y': output
            }, params);
        break;

        case 'webm':
            params = Object.assign({}, {
                '-i': file,
                '-acodec': 'libvorbis',
                '-ab': '128k',
                '-ar': '44100',
                '-vcodec': 'libvpx',
                '-b': '614400',
                '-aspect': '16:9',
                '-y': output
            }, params);
        break;

        case 'mp3':
            params = Object.assign({}, {
                '-i': file,
                '-acodec': 'libmp3lame',
                '-ab': '128k',
                '-ar': '44100',
                '-y': output
            }, params);
        break;

        case 'm4a':
            params = Object.assign({}, {
                '-i': file,
                '-acodec': 'aac',
                '-ab': '64k',
                '-ar': '44100',
                '-strict': '-2',
                '-y': output
            }, params);
        break;
    }

    /* convert to plain array */
    return Object.keys(params).reduce(
        (cur, key) => cur.concat(key, params[key]), []
    );
}

module.exports = (job, settings, options, type) => {
    if (type != 'postrender') {
        throw new Error(`Action ${name} can be only run in postrender mode, you provided: ${type}.`)
    }

    settings.logger.log(`[${job.uid}] starting action-encode action (ffmpeg)`)

    const params = constructParams(job, settings, options);
    const binary = process.platform != 'win32'
        ? process.platform == 'darwin' ? macos : null
        : win32;

    if (!binary || !fs.existsSync(binary)) {
        return Promise.reject(new Error('can\'t access ffmpeg binary: ' + binary))
    }

    return new Promise((resolve, reject) => {
        const instance = spawn(binary, params);

        instance.on('error', err => reject(new Error(`Error starting ffmpeg process: ${err}`)));
        instance.stderr.on('data', (data) => settings.logger.log(`[${job.uid}] ${data.toString()}`));
        instance.stdout.on('data', (data) => settings.debug && settings.logger.log(`[${job.uid}] ${data.toString()}`));

        /* on finish (code 0 - success, other - error) */
        instance.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error('Error in action-encode module (ffmpeg)'))
            }

            resolve(job)
        });
    });
}
