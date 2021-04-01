const { existsSync, promises: fsPromises } = require('fs');

const copyFile = async (src, dest) => {
  if (existsSync(dest)) return;

  return fsPromises.copyFile(src, dest)
}

const removeFile = async (fileUri) => {
  if (!existsSync(fileUri)) return;
  return fsPromises.rm(fileUri);
}

module.exports = {
  copyFile,
  removeFile,
}
