const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');


module.exports = async (job, settings, params = {}) => {
    settings.logger.log(`[${job.uid}] [action-compress] starting`);

    if (params.format !== 'zip') {
        throw new Error(`[${job.uid}] [action-compress] unsupported format: ${params.format}`);
    }

    const zip = new AdmZip();

    params.input.forEach(input => {
        const inputPath = path.join(job.workpath, input);

        if (input.includes('#####')) {
            settings.logger.log(`[${job.uid}] [action-compress] adding image sequence: ${inputPath}`);
            // support for image sequences where AE generates list of files with frame numbers
            const files = fs.readdirSync(path.dirname(inputPath));
            const patternMatch = input.replace('#####', '\\d{5}');
            const pattern = new RegExp(patternMatch);
            const matchingFiles = files.filter(file => pattern.test(file));
            matchingFiles.forEach(file => {
                zip.addLocalFile(
                    path.join(path.dirname(inputPath), file)
                );
            });

            return;
        }

        if (!fs.existsSync(inputPath)) {
            throw new Error(`[${job.uid}] [action-compress] file not found: ${inputPath}`);
        }

        const stat = fs.statSync(inputPath);

        if (stat.isDirectory()) {
            settings.logger.log(`[${job.uid}] [action-compress] adding directory: ${inputPath}`);
            zip.addLocalFolder(inputPath, input);
        } else if (stat.isFile()) {
            settings.logger.log(`[${job.uid}] [action-compress] adding file: ${inputPath}`);
            zip.addLocalFile(inputPath);
        } else {
            throw new Error(`[${job.uid}] [action-compress] file is not a file or directory: ${inputPath}`);
        }
    });

    zip.writeZip(path.join(job.workpath, params.output));

    return job;
}
