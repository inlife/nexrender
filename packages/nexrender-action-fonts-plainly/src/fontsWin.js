const { copyFile, removeFile} = require('./utils');
const { registryAdd, registryExists, registryRemove} = require('./reg');
const { basename, join } = require('path');

const FONTS_DIRECTORY = "C:\\windows\\fonts";
const FONTS_REG_KEY = "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts";

const install = async (workDir, fonts, settings) => {
  return Promise.all(
    fonts.map(async (f) => {
      const fontName = basename(f);
      const fontSrc = join(workDir, f);

      try {
        const regExists = await registryExists(FONTS_REG_KEY, fontName);
        if (!regExists) {
          // Copy file to the fonts directory
          await copyFile(fontSrc, join(FONTS_DIRECTORY, fontName));
          // Add font to windows registry
          await registryAdd(FONTS_REG_KEY, fontName, settings);

          settings.logger.log(`Font ${fontName} [${fontSrc}] installed.`);
        } else {
          settings.logger.log(`Font ${fontName} already installed.`);
        }
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
        const regExists = await registryExists(FONTS_REG_KEY, fontName);
        if (regExists) {
          // Remove file from the fonts directory
          await removeFile(join(FONTS_DIRECTORY, fontName));
          // Remove font from windows registry
          return registryRemove(FONTS_REG_KEY, fontName, settings);
        }

        settings.logger.log(`Font ${fontName} uninstalled.`);
      } catch (e) {
        settings.logger.log(`Font ${fontName} [${fontSrc}] failed to uninstall due to:\n${e}\n.`);
      }
    })
  );
};

module.exports = {
  install,
  uninstall,
}

