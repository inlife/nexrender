const { homedir } = require('os');
const { basename, join } = require('path');
const { copyFile, removeFile } = require('./utils');

const FONTS_DIRECTORY = join(homedir(), "Library", "Fonts");

const install = async (workDir, fonts) => {
  return Promise.all(
    fonts.map(async (f) => {
      const fontSrc = join(workDir, f);
      await copyFile(fontSrc, join(FONTS_DIRECTORY, basename(f)));
    })
  );
};

const uninstall = async (fonts) => {
  return Promise.all(
    fonts.map(async (f) => {
      await removeFile(join(FONTS_DIRECTORY, basename(f)));
    })
  );
};

module.exports = {
  install,
  uninstall,
}
