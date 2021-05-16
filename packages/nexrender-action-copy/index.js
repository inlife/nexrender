const fs = require('fs')
const {name} = require('./package.json')
const path = require('path')
const globFn = require('glob')

module.exports = (job, settings, { input, output, glob }, type) => {
    if (type != 'postrender') {
        throw new Error(`Action ${name} can be only run in postrender mode, you provided: ${type}.`)
    }

    /* check if input has been provided */
    input = input || job.output;

    /* fill absolute/relative paths */
    if (!path.isAbsolute(input)) input = path.join(job.workpath, input);
    if (!path.isAbsolute(output)) output = path.join(job.workpath, output);

    return new Promise((resolve) => {

        if (glob) { // Search files that match glob

            if (!fs.lstatSync(output).isDirectory()) {
                throw new Error(`If input is glob, output has to be a directory!`);
            }

            settings.logger.log(`[${job.uid}] action-copy: Matching paths for: ${input}`);

            globFn(input, (err, matches) => {
                if (err) throw err;

                if (matches.length === 0) return resolve(job);

                matches.forEach((absFilePath, index) => {
                    const filePath = path.relative(job.workpath, absFilePath);
                    const dest = path.join(output, filePath);

                    /* Make directories recursively if not exist */
                    if (!fs.existsSync(path.dirname(dest))) {
                        fs.mkdirSync(path.dirname(dest), { recursive: true });
                    }

                    settings.logger.log(`[${job.uid}] action-copy: Copy ${absFilePath} to ${dest}`);
                    fs.copyFile(absFilePath, dest, (err) => {
                        if (err) throw err;

                        if (index === matches.length - 1) resolve(job);
                    });
                })
            });

        } else {  // Copy single file
            settings.logger.log(`[${job.uid}] action-copy: Copy ${input} to ${output}`);
            fs.copyFile(input, output, (err) => {
                if (err) throw err;
                resolve(job);
            });
        }

    })

}
