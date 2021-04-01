const { copyFile, removeFile} = require('./utils');
const { registryAdd, registryExists, registryRemove} = require('./reg');
const { basename, join } = require('path');

const FONTS_DIRECTORY = "C:\\windows\\fonts";
const FONTS_REG_KEY = "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts";

const install = async (workDir, fonts) => {
  return Promise.all(
    fonts.map(async (f) => {
      const fontName = basename(f);

      const regExists = await registryExists(FONTS_REG_KEY, fontName);
      if (!regExists) {
        // Copy file to the fonts directory
        const fontSrc = join(workDir, f);
        await copyFile(fontSrc, join(FONTS_DIRECTORY, fontName));
        // Add font to windows registry
        return registryAdd(FONTS_REG_KEY, fontName);
      }
    })
  );
};

const uninstall = async (fonts) => {
  return Promise.all(
    fonts.map(async (f) => {
      const fontName = basename(f);

      const regExists = await registryExists(FONTS_REG_KEY, fontName);
      if (regExists) {
        // Remove file from the fonts directory
        await removeFile(join(FONTS_DIRECTORY, fontName));
        // Remove font from windows registry
        return registryRemove(FONTS_REG_KEY, fontName);
      }
    })
  );
};

module.exports = {
  install,
  uninstall,
}

