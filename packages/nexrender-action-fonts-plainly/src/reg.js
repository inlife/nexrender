const { execSync } = require("child_process");

const registryExists = async (regKey, name) => {
  const fileName = name.substr(0, name.lastIndexOf("."));

  try {
    execSync(`REG QUERY "${regKey}" /v "${fileName} (TrueType)"`);
    return true;
  } catch (e) {
    return false;
  }
};

const registryAdd = async (regKey, name, settings) => {
  const fileName = name.substr(0, name.lastIndexOf("."));
  const cmd = `REG ADD "${regKey}" /v "${fileName} (TrueType)" /t REG_SZ /d "${name}" /f`;

  try {
    execSync(cmd);
    settings.logger.log(`Registry successfully added (${cmd}).`);
  } catch (e) {
    throw new Error(`Registry command failed (${cmd}): ${e.message}`);
  }
};

const registryRemove = async (regKey, name, settings) => {
  const fileName = name.substr(0, name.lastIndexOf("."));
  const cmd = `REG DELETE "${regKey}" /v "${fileName} (TrueType)" /f`;

  try {
    execSync(cmd);
    settings.logger.log(`Registry successfully removed (${cmd}).`);
  } catch (e) {
    throw new Error(`Registry command failed (${cmd}): ${e.message}`);
  }
};

module.exports = {
  registryExists,
  registryAdd,
  registryRemove,
}
