const os = require('os');
const {dirname} = require('path');

const isWin = os.type() === 'Windows_NT';

let fontService;
if (isWin) {
  fontService = require('./fontsWin');
} else {
  fontService = require('./fontsOsx');
}

const ACTIONS = {
  INSTALL: 'install',
  UNINSTALL: 'uninstall',
};

module.exports = (job, settings, { fonts, action }) => {
  const projectDir = dirname(job.template.src).replace('file://', '');

  return new Promise(async (resolve, reject) => {
    try {

      switch (action) {
        case ACTIONS.INSTALL:
          settings.logger.log(`[${job.uid}] action-fonts-plainly: Installing fonts: ${fonts}`);
          await fontService.install(projectDir, fonts);
          break;
        case ACTIONS.UNINSTALL:
          settings.logger.log(`[${job.uid}] action-fonts-plainly: Uninstalling fonts: ${fonts}`);
          // TODO: Address possible issues:
          //  - parallel renders could use a same font, thus uninstall could break another render
          //  - preinstalled fonts should not be removed!
          await fontService.uninstall(fonts);
          break;
        default:
          return reject(new Error("Please specify a valid action (install / uninstall)"));
      }

    } catch (e) {
      settings.logger.log(`[${job.uid}] Error in action-fonts-plainly action: \n${e.stack}`);
    }

    resolve(job);
  });
};
