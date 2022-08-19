const fs = require('fs')
const {name} = require('./package.json')
const path = require('path')
const ffmpegHelper = require('./ffmpeg');

module.exports = (job, settings, { input, output }, type) => {
    if (type != 'postrender') {
        throw new Error(`Action ${name} can be only run in postrender mode, you provided: ${type}.`)
    }

    /* fill absolute/relative paths */
    if (!path.isAbsolute(input)) input = path.join(job.workpath, input);
    if (!path.isAbsolute(output)) output = path.join(job.workpath, output);

    return new Promise((resolve) => {
      let videoDuration = 0.0;
      try {
        videoDuration = ffmpegHelper.getVideoDurationInSeconds(input);
        settings.logger.log(`[${job.uid}] action-video-duration: Video duration is ${videoDuration} seconds.`);
      } catch (e) {
        settings.logger.log(`[${job.uid}] action-video-duration: Error: ${e}`);
      }

      fs.writeFile(output, videoDuration.toPrecision(), (err) => {
          if (err) {
            settings.logger.log(`[${job.uid}] action-video-duration: Write file error: ${err}`);
          }

          resolve(job);
      });

    })

}
