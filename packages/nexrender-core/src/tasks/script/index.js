const fs     = require('fs')
const path   = require('path')
const script = require('../../assets/nexrender.jsx')

const wrapFootage = require('./wrap-footage')
const wrapData    = require('./wrap-data')
const wrapEnhancedScript = require('./wrap-enhanced-script')

module.exports = (job, settings) => {
    settings.logger.log(`[${job.uid}] running script assemble...`);

    const data = [];
    const base = job.workpath;

    job.assets.map(asset => {
        settings.trackCombined('Asset Script Wraps', {
            job_id: job.uid, // anonymized internally
            script_type: asset.type,
            script_compostion_set: asset.composition !== undefined,
            script_layer_strat: asset.layerName ? 'name' : 'index',
            script_value_strat:
                asset.value !== undefined ? 'value' : // eslint-disable-line no-nested-ternary, multiline-ternary
                asset.expression !== undefined ? 'expression' : // eslint-disable-line multiline-ternary
                undefined,
        })

        switch (asset.type) {
            case 'video':
            case 'audio':
            case 'image':
                data.push(wrapFootage(job, settings, asset));
                break;

            case 'data':
                data.push(wrapData(job, settings, asset));
                break;

            case 'script':
                data.push(wrapEnhancedScript(job, settings, asset));
                break;
        }
    });

    /* write out assembled custom script file in the workpath */
    job.scriptfile = path.join(base, `nexrender-${job.uid}-script.jsx`);
    fs.writeFileSync(job.scriptfile, script
        .replace('/*COMPOSITION*/', job.template.composition)
        .replace('/*USERSCRIPT*/', () => data.join('\n'))
    );

    return Promise.resolve(job)
}