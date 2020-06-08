const fs      = require('fs')
const path    = require('path')
const glob    = require('glob')
const {spawn} = require('child_process')

const getBinary  = require('./binary')
const getPreset  = require('./presets')

const getInputFiles =  (pattern) => {
  const inputFiles = glob.sync(pattern);
  return glob.sync(pattern).map(path.parse)
}

module.exports = async (job, settings, options, type) => {
  settings.logger.log(`[${job.uid}] starting action-encode action (ffmpeg)`)

  let {preset, params = {}, ffmpeg, input, output} = options;
  if(!input) input = output

  try {
    const binary = await getBinary(settings, ffmpeg)
    const inputPath = path.parse((( !path.isAbsolute(input)) ? path.join(settings.workpath, input) : input));

    settings.logger.log(`[${job.uid}] action-encode: looking for files at ${inputPath.dir}/${inputPath.base}`)
    const inputFiles = getInputFiles(`${inputPath.dir}/${inputPath.base}`);
    settings.logger.log(`[${job.uid}] action-encode: converting ${inputFiles.length} files`)

    for(const inputFile of inputFiles) {
      const inputPath = `${ inputFile.dir }/${ inputFile.base }`
      const outputPath = `${ inputFile.dir }/${ inputFile.name }.${ preset }`

      settings.logger.log(`[${job.uid}] action-encode: input file ${inputPath}`)
      settings.logger.log(`[${job.uid}] action-encode: output file ${outputPath}`)

      await new Promise((resolve, reject) => {
        const instance = spawn(binary, getPreset(inputPath, outputPath, preset, params));
        instance.on('error', err => reject(new Error(`Error starting ffmpeg process: ${err}`)));
        instance.stderr.on('data', (data) => settings.logger.log(`[${job.uid}] ${data.toString()}`));
        instance.stdout.on('data', (data) => settings.debug && settings.logger.log(`[${job.uid}] ${data.toString()}`));
        instance.on('close', (code) => {
          if (code !== 0) reject(new Error('Error in child process (ffmpeg) code : ' + code))
          else resolve()
        });
      });

      if(type === 'prerender'){
        job.assets
          .filter(asset => asset.type === 'video' && path.parse(asset.src).name === inputFile.base)
          .forEach(assetFile => assetFile.name = `${ inputFile.name }.${ preset }`);
      }
    }
  } catch(e) {
    console.log('index error', JSON.stringify(e, null, 2))
    throw new Error('Error in action-encode module (ffmpeg) ' + e)
  };
}

