const fs = require("fs");
const path = require("path");
const SFTPS = require("sftps");

const escapeshell = (cmd) => {
    return cmd.replace(/(["\s'$`\\])/g, "\\$1");
};

const upload = (job, settings, src, params) => {
    if (!params.host) throw new Error("SFTP Host not provided.");
    if (!params.port) throw new Error("SFTP Port not provided.");
    if (!params.user) throw new Error("SFTP Username not provided.");
    if (!params.password) throw new Error("SFTP Password not provided.");

    let file;

    return new Promise((resolve, reject) => {
        // Read file
        try {
            file = fs.createReadStream(src);
        } catch (e) {
            throw new Error(
                "Could not read file. Please check path and permissions.",
            );
        }

        file.on("error", (err) => reject(err));

        const filename = path.basename(src);
        const output = params.output || filename;

        const sftp = new SFTPS({
            host: params.host,
            username: params.user,
            password: params.password,
            port: params.port,
        });

        sftp.put(src, escapeshell(output), (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

module.exports = {
    upload,
};
