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
    const proc = childProcess.fork(__filename, ['child', args], {
        stdio: 'ignore',
    })
}

/**
 * Tracking function for analytics
 *
 * @param {*} settings
 * @param {*} event
 * @param {*} properties
 * @returns {Promise<void>}
 */
const track = async (settings, event, properties = {}, isRemote) => {
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

    // collect system info
    if (!settings.systemInfo) {
        if (isRemote) console.log('collectiing systeminfo')

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

    // anonymize job_id
    if (properties.job_id) {
        properties.job_id = hash(properties.job_id, settings.analyticsId)
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

    analytics.capture(params);
    await analytics.flush();
}

if (process.argv[2] === 'child') {
    const args = JSON.parse(process.argv[3])
    track(args.settings, args.event, args.properties, true)
        .then(() => {})
}

module.exports = track
