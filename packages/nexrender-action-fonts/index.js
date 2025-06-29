const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { name } = require("./package.json");

const installMac = async (settings, job, fontpath) => {
    const fontdir = path.join(process.env.HOME, "Library", "Fonts");
    const fontdest = path.join(fontdir, path.basename(fontpath));

    if (!fs.existsSync(fontdir)) {
        fs.mkdirSync(fontdir, { recursive: true });
    }

    if (fs.existsSync(fontdest)) {
        settings.logger.log(`[action-fonts] Font ${fontdest} already exists, skipping.`);
        return 0;
    }

    settings.logger.log(`[action-fonts] Installing font ${fontpath} to ${fontdest}...`);
    fs.copyFileSync(fontpath, fontdest);

    return 1;
};

const installWin = async (settings, job, fontpath) => {
    const fontdir = path.join(process.env.LOCALAPPDATA, "Microsoft", "Windows", "Fonts");
    const fontdest = path.join(fontdir, path.basename(fontpath));

    if (!fs.existsSync(fontdir)) {
        fs.mkdirSync(fontdir, { recursive: true });
    }

    if (fs.existsSync(fontdest)) {
        settings.logger.log(`[action-fonts] Font ${fontdest} already exists, skipping.`);
        return 0;
    } else {
        settings.logger.log(`[action-fonts] Installing font ${fontpath} to ${fontdest}...`);
        fs.copyFileSync(fontpath, fontdest);
    }


    try {
        const fontdisplayname = path.basename(fontpath, path.extname(fontpath));
        const fontreg = `reg add "HKCU\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Fonts" /v "${fontdisplayname} (TrueType)" /t REG_SZ /d "${fontdest}" /f`;

        settings.logger.log(`[action-fonts] Adding font ${fontdest} to registry...`);
        execSync(fontreg);
    } catch (e) {
        settings.logger.log(`[action-fonts] Error adding font ${fontdest} to registry: ${e.message}`);
    }

    return 1;
};

const notifyWin = async (job) => {
    const script = path.join(job.workpath, "notify.vbs");
    const content = `
        Set objShell = CreateObject("WScript.Shell")
        objShell.Run "RUNDLL32.EXE user32.dll,UpdatePerUserSystemParameters"
    `;

    fs.writeFileSync(script, content, "utf8");
    execSync(`cscript //nologo ${script}`);
}

const uninstallWin = async (settings, job, fontpath) => {
    const fontdir = path.join(process.env.LOCALAPPDATA, "Microsoft", "Windows", "Fonts");
    const fontdest = path.join(fontdir, path.basename(fontpath));

    settings.logger.log(`[action-fonts] Uninstalling font ${fontdest}...`);

    /* remove from registry */
    const fontdisplayname = path.basename(fontpath, path.extname(fontpath));
    const fontreg = `reg delete "HKCU\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Fonts" /v "${fontdisplayname} (TrueType)" /f`;

    try {
        execSync(fontreg);
    } catch (e) {
        settings.logger.log(`[action-fonts] Error removing font ${fontdest} from registry: ${e.message}`);
    }

    try {
        if (fs.existsSync(fontdest)) {
            fs.unlinkSync(fontdest);
        }
    } catch (e) {
        settings.logger.log(`[action-fonts] Error removing font ${fontdest}: ${e.message}`);
    }

    return 1;
}

const uninstallMac = async (settings, job, fontpath) => {
    const fontdir = path.join(process.env.HOME, "Library", "Fonts");
    const fontdest = path.join(fontdir, path.basename(fontpath));

    settings.logger.log(`[action-fonts] Uninstalling font ${fontdest}...`);

    try {
        if (fs.existsSync(fontdest)) {
            fs.unlinkSync(fontdest);
        }
    } catch (e) {
        settings.logger.log(`[action-fonts] Error removing font ${fontdest}: ${e.message}`);
    }
}

module.exports = async (job, settings, params, type) => {
    if (type != "prerender" && type != "postrender") {
        throw new Error(
            `Action ${name} can be only run in prerender or postrender mode, you provided: ${type}.`,
        );
    }

    /* add this action to postrender if it's not already there, to clean up the fonts after the render */
    if (type == "prerender") {
        job.actions.postrender.push({
            module: __filename,
        });

        let fontsAdded = 0;

        /* iterate over assets, and install all assets which are fonts */
        for (const asset of job.assets) {
            if (asset.type !== "static") {
                continue;
            }

            if (!asset.src.match(/\.(ttf)$/)) {
                continue;
            }

            if (!asset.name) {
                throw new Error(`Asset ${asset.src} has to be named using the "name" property that would contain the font name as it is used to be then used in the After Effets project.`);
            }

            if (process.platform === "darwin") {
                fontsAdded += await installMac(settings, job, asset.dest);
            } else if (process.platform === "win32") {
                fontsAdded += await installWin(settings, job, asset.dest);
            } else {
                throw new Error(`Platform ${process.platform} is not supported.`);
            }
        }

        if (fontsAdded > 0 && process.platform === "win32") {
            await notifyWin(job);
        }
    } else if (type == "postrender") {
        for (const asset of job.assets) {
            if (asset.type !== "static") {
                continue;
            }

            if (!asset.src.match(/\.(ttf)$/)) {
                continue;
            }

            if (process.platform === "darwin") {
                await uninstallMac(settings, job, asset.dest);
            } else if (process.platform === "win32") {
                await uninstallWin(settings, job, asset.dest);
            }
        }
    }

    return job;
};
