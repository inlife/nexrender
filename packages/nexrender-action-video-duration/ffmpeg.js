const execSync = require('child_process').execSync

const FFMPEG_BIN = process.env.NEXRENDER_FFMPEG;

const FFMPEG_STDOUT_TIME_REGEX = /time=(\d{2}:\d{2}:\d{2}\.\d+)/g;

/** Convert HH:MM:SS.MS to seconds */
const hmsToSeconds = (hmsTime) =>
  new Date('1970-01-01T' + hmsTime + 'Z').getTime() / 1000;

const getVideoDurationInSeconds = (videoUrl) => {
  const ffmpegCmd = [FFMPEG_BIN, `-i ${videoUrl}`, '-f null', '-', '2>&1'].join(' ');

  const output = execSync(ffmpegCmd).toString();

  const hmsTimeRegexResult = [...output.matchAll(FFMPEG_STDOUT_TIME_REGEX)];

  if (hmsTimeRegexResult && hmsTimeRegexResult.length > 0) {
    return hmsToSeconds(hmsTimeRegexResult.pop()[1]);
  } else {
    throw new Error('Could not extract time from the ffmpeg output.');
  }
};

module.exports = {
  getVideoDurationInSeconds
}
