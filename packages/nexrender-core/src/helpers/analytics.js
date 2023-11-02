const fs           = require('fs')
const os           = require('os')
const path         = require('path')
const crypto       = require('crypto')

const si           = require('systeminformation')
const { nanoid }   = require('nanoid')
const {PostHog}    = require('posthog-node')
const childProcess = require('child_process')

const { version }  = require('../../package.json')

const hash = (data, salt) => crypto
    .createHmac('md5', salt)
    .update(data)
    .digest('hex');

const analyticsPublicKey = 'phc_AWcZMlCOqHJiFyFKSoxT9WSrRkdKDFxpiFn8Ww0ZMHu';
const analytics = new PostHog(analyticsPublicKey, {
    host: 'https://eu.posthog.com',
    flushAt: 1,
    flushInterval: 0,
    disableGeoip: true,
});

/**
 * A helper function to force syncronous tracking
 *
 * @param {*} settings
 * @param {*} event
 * @param {*} properties
 */
const forceSyncRequest = (settings, event, properties) => {
    const args = JSON.stringify({settings, event, properties})
    childProcess.fork(__filename, ['child', args], {
        stdio: 'ignore',
    })
}

// cache for combined events
let cache = {
    job_id: null,
    data: {},
}

/**
 * Tracking function for analytics
 *
 * @param {*} settings
 * @param {*} event
 * @param {*} properties
 * @returns {Promise<void>}
 */
const track = async (settings, event, properties = {}) => {
    // if (isRemote) console.log('tracking', event, properties, settings)

    if (settings.noAnalytics === true) return;

    if (!settings.session) {
        settings.session = hash(nanoid(), 'nexrender-session')
    }

    // make sure we have a unique id for this user
    if (!settings.analyticsId) {
        let filepath = path.join(os.homedir(), '.nexrender', 'uuid')
        if (fs.existsSync(filepath)) {
            settings.analyticsId = fs.readFileSync(filepath, 'utf8')
        } else {
            settings.analyticsId = hash(nanoid(), 'nexrender-analytics')
            if (!fs.existsSync(path.dirname(filepath)))
                fs.mkdirSync(path.dirname(filepath), { recursive: true })

            fs.writeFileSync(filepath, settings.analyticsId)
        }
    }

    // make sure we wait to send the event if there is an error
    if (properties.forced === true) {
        delete properties.forced
        properties.$timestamp = (new Date()).toISOString();
        return forceSyncRequest(settings, event, properties)
    }

    // anonymize job_id (we are doing it after the forced check,
    // to ensure we won't be hashing the same value twice)
    if (properties.job_id) {
        properties.job_id = hash(properties.job_id, settings.analyticsId)
    }

    // we are not sending the event itself, but rather combining it with other events of the same type
    // and sending it as a single event when flush is triggered
    if (properties.combined === true) {
        delete properties.combined

        // remove any data from previous jobs
        if (cache.job_id != properties.job_id) {
            cache.job_id = properties.job_id
            cache.data = {}
        }

        cache.data[event] = cache.data[event] || []
        cache.data[event].push(properties)

        return;
    }

    // collect system info
    if (!settings.systemInfo) {
        // if (isRemote) console.log('collecting systeminfo')

        settings.systemInfo = await si.get({
            cpu: 'manufacturer,brand,cores',
            mem: 'total',
            graphics: '*',
            osInfo: 'platform,arch,distro,release',
            dockerInfo: 'id',
        })

        properties.$set_once = {
            sys_cpu_manufacturer: settings.systemInfo.cpu.manufacturer,
            sys_cpu_brand: settings.systemInfo.cpu.brand,
            sys_cpu_cores: settings.systemInfo.cpu.cores,
            sys_mem_total: settings.systemInfo.mem.total,
            sys_graphics_vendor: (settings.systemInfo.graphics.controllers[0] || []).vendor,
            sys_graphics_model: (settings.systemInfo.graphics.controllers[0] || []).model,
            sys_os_platform: settings.systemInfo.osInfo.platform,
            sys_os_arch: settings.systemInfo.osInfo.arch,
            sys_os_distro: settings.systemInfo.osInfo.distro,
            sys_os_release: settings.systemInfo.osInfo.release,
            sys_docker: !!settings.systemInfo.dockerInfo.id,
        }
    }

    if (event == 'Job Cleanup') {
        const events = Object.keys(cache.data)

        for (let i = 0; i < events.length; i++) {
            const combinedEvent = events[i]
            const combinedProperties = cache.data[combinedEvent]

            switch (combinedEvent) {
                case 'Asset Download':
                    properties.assets_total = combinedProperties.length

                    for (let j = 0; j < combinedProperties.length; j++) {
                        const asset = combinedProperties[j]
                        const byProtocol = `assets_by_protocol_${asset.asset_protocol}`
                        const byExtension = `assets_by_extension_${asset.asset_extension}`
                        properties[byProtocol] = (properties[byProtocol] || 0) + 1
                        properties[byExtension] = (properties[byExtension] || 0) + 1
                    }

                    break;

                case 'Asset Script Wraps':
                    properties.assets_script_wraps = combinedProperties.length

                    for (let j = 0; j < combinedProperties.length; j++) {
                        const script = combinedProperties[j]
                        const byType = `assets_by_type_${script.script_type}`
                        const byComposition = `assets_by_composition_set_${script.script_composition_set ? 'true' : 'false'}`
                        const byLayerStrategy = `assets_by_layer_strategy_${script.script_layer_strat || 'none'}`
                        const byValueStrategy = `assets_by_value_strategy_${script.script_value_strat || 'none'}`
                        properties[byType] = (properties[byType] || 0) + 1
                        properties[byComposition] = (properties[byComposition] || 0) + 1
                        properties[byLayerStrategy] = (properties[byLayerStrategy] || 0) + 1
                        properties[byValueStrategy] = (properties[byValueStrategy] || 0) + 1
                    }

                    break;
            }
        }
    }

    const params = {
        distinctId: settings.analyticsId,
        event,
        properties: Object.assign({
            process: settings.process,
            version: version,
            debug: settings.debug,
            $timestamp: (new Date()).toISOString(),
            $session_id: settings.session,
        }, properties)
    }

    // console.log('tracking event:', params)

    analytics.capture(params);
    await analytics.flush();
}

if (process.argv[2] === 'child') {
    const args = JSON.parse(process.argv[3])
    track(args.settings, args.event, args.properties)
        .then(() => {})
}

module.exports = track
