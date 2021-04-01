const { exec } = require("child_process");

const registryExists = (regKey, name) => {
  return new Promise((resolve) => {
    const fileName = name.substr(0, name.lastIndexOf("."));

    exec(`REG QUERY "${regKey}" /v "${fileName}"`, (error, stdout) => {
      if (error) return resolve(false);

      if (stdout === "1") return resolve(false);

      return resolve(true);
    });
  });
};

const registryAdd = async (regKey, name) => {
  return new Promise((resolve, reject) => {
    const fileName = name.substr(0, name.lastIndexOf("."));

    exec(`REG ADD "${regKey}" /v "${fileName}" /t REG_SZ /d ${name} /f`, (error, stdout) => {
      if (error) return reject(error.message);

      if (stdout === "1") return reject(`Unable to add registry: ${name}!`);

      return resolve(`Registry ${name} is successfully added!`);
    });
  });
};

const registryRemove = async (regKey, name) => {
  return new Promise((resolve, reject) => {
    const fileName = name.substr(0, name.lastIndexOf("."));

    exec(`REG DELETE "${regKey}" /v "${name}" /f`, (error, stdout) => {
      if (error) return reject(error.message);

      if (stdout === "1") return reject(`Unable to remove registry: ${name}!`);

      return resolve(`Registry ${name} is successfully removed!`);
    });
  });
};

module.exports = {
  registryExists,
  registryAdd,
  registryRemove,
}
