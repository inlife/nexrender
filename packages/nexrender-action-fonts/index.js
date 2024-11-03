const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { name } = require("./package.json");

const installMac = async (settings, job, fontpath) => {
    const fontdir = path.join(process.env.HOME, "Library", "Fonts");

    if (!fs.existsSync(fontdir)) {
        fs.mkdirSync(fontdir, { recursive: true });
    }

    if (fs.existsSync(fontpath)) {
        settings.logger.log(`[action-fonts] Font ${fontpath} already exists, skipping.`);
        return 0;
    }

    settings.logger.log(`[action-fonts] Installing font ${fontpath} to ${fontdir}...`);
    fs.copyFileSync(fontpath, path.join(fontdir, path.basename(fontpath)));

    return 1;
};

const installWin = async (settings, job, fontpath) => {
    const fontdir = path.join(process.env.LOCALAPPDATA, "Microsoft", "Windows", "Fonts");

    if (!fs.existsSync(fontdir)) {
        fs.mkdirSync(fontdir, { recursive: true });
    }

    if (fs.existsSync(fontpath)) {
        settings.logger.log(`[action-fonts] Font ${fontpath} already exists, skipping.`);
        return 0;
    }

    settings.logger.log(`[action-fonts] Installing font ${fontpath} to ${fontdir}...`);

    const fontdest = path.join(fontdir, path.basename(fontpath));
    fs.copyFileSync(fontpath, fontdest);

    const fontdisplayname = path.basename(fontpath, path.extname(fontpath)).replace(/-/g, " ");
    const fontreg = `reg add "HKCU\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Fonts" /v "${fontdisplayname} (TrueType)" /t REG_SZ /d "${fontdest}" /f`;

    execSync(fontreg);
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

module.exports = async (job, settings, params, type) => {
    if (type != "prerender") {
        throw new Error(
            `Action ${name} can be only run in prerender mode, you provided: ${type}.`,
        );
    }

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

    return job;
};
