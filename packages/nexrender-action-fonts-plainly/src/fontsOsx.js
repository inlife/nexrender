const { homedir } = require('os');
const { basename, join } = require('path');
const { copyFile, removeFile } = require('./utils');

const FONTS_DIRECTORY = join(homedir(), "Library", "Fonts");

const install = async (workDir, fonts, settings) => {
  return Promise.all(
    fonts.map(async (f) => {
      const fontName = basename(f);
      const fontSrc = join(workDir, f);

      try {
        await copyFile(fontSrc, join(FONTS_DIRECTORY, fontName));

        settings.logger.log(`Font ${fontName} [${fontSrc}] installed.`);
      } catch (e) {
        settings.logger.log(`Font ${fontName} [${fontSrc}] failed to uninstall due to:\n${e}\n.`);
      }
    })
  );
};

const uninstall = async (fonts, settings) => {
  return Promise.all(
    fonts.map(async (f) => {
      const fontName = basename(f);

      try {
        await removeFile(join(FONTS_DIRECTORY, fontName));

        settings.logger.log(`Font ${fontName} uninstalled.`);
      } catch (e) {
        settings.logger.log(`Font ${fontName} failed to uninstall due to:\n${e}\n.`);
      }

    })
  );
};

module.exports = {
  install,
  uninstall,
}
