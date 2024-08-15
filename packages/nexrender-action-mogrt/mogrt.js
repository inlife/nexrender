const StreamZip = require("node-stream-zip")
const tempy = require("tempy");
const path = require("node:path");

function flattenStrings(obj, doNotCopy) {
    if (!doNotCopy) obj = JSON.parse(JSON.stringify(obj));
    for (let [k, v] of Object.entries(obj)) {
        if (typeof v === 'object') {
            if (!Array.isArray(v) && 'strDB' in v) {
                if (v.strDB.length) {
                    obj[k] = Object.values(v.strDB)[0].str;
                } else {
                    obj[k] = '';
                }
            } else {
                obj[k] = flattenStrings(v, true);
            }
        }
    }
    return obj;
}

class Mogrt {
    constructor(filename) {
        this.filename = filename;
        this.initialized = false;
        this._manifest = null;
    }

    _getZip() {
        return new StreamZip.async({ file: this.filename });
    }

    isAfterEffects() {
        if (!this.initialized) throw Error('Must initialise with .init() first');
        return this._manifest['authorApp'] === 'aefx';
    }

    isPremiere() {
        if (!this.initialized) throw Error('Must initialise with .init() first');
        return this._manifest['authorApp'] === 'ppro';
    }

    getEssentialFields(flattened) {
        if (!this.initialized) throw Error('Must initialise with .init() first');
        flattened = typeof flattened === 'undefined' || flattened;
        let { clientControls } = this._manifest;
        if (flattened) {
            clientControls = flattenStrings(clientControls);
        } else {
            clientControls = JSON.parse(JSON.stringify(clientControls));
        }
        return clientControls;
    }

    async extractTo(toPath) {
        const zip = this._getZip();
        const entries = [];
        await tempy.file.task(async (tempPath) => {
            await zip.extract('project.aegraphic', tempPath);
            const aegraphicZip = new StreamZip.async({ file: tempPath });
            aegraphicZip.on('entry', entry => entries.push(path.join(toPath, entry.name)));
            await aegraphicZip.extract(null, toPath);
            await Promise.all([
                aegraphicZip.close(),
                zip.close()
            ]);
        });
        return entries;
    }

    async getManifest(flattened) {
        flattened = typeof flattened === 'undefined' || flattened;
        if (this._manifest === null) {
            const zip = this._getZip();
            this._manifest = JSON.parse((await zip.entryData('definition.json')).toString());
            await zip.close();
        }
        if (flattened) {
            return flattenStrings(this._manifest)
        } else {
            return this._manifest;
        }
    }

    async init() {
        await this.getManifest(false);
        this.initialized = true;
    }
}

module.exports = Mogrt;
