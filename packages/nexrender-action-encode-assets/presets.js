/* pars of snippet taken from https://github.com/xonecas/ffmpeg-node/blob/master/ffmpeg-node.js#L136 */
module.exports = (input, output, preset, params) => {
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
            "-ss": '61.0',
            "-t": '2.5',
            "-filter_complex": `[0:v] fps=12,scale=480:-1,split [a][b];[a] palettegen [p];[b][p] paletteuse`,
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

