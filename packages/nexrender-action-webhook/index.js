const fetch = global.fetch || require('node-fetch');

const replaceJobData = (settings, job, data) => {
    if (typeof data === 'string') {
        // find all occurences of {job.*} in the string
        return data.replace(/{job\.([^}]+)}/g, (match, path) => {
            const rest = path.split('.');

            if (!rest.length) {
                return ''
            }

            const value = rest.reduce((acc, key) => {
                if (acc === undefined) {
                    return acc;
                }

                return acc[key];
            }, job);

            return value;
        })
    }

    if (Array.isArray(data)) {
        return data.map(item => replaceJobData(settings, job, item));
    }

    if (typeof data === 'object') {
        return Object.keys(data).reduce((acc, key) => {
            acc[key] = replaceJobData(settings, job, data[key]);
            return acc;
        }, {});
    }

    return data;
}

module.exports = async (job, settings, { url, method, headers, json, body }) => {
    url = replaceJobData(settings, job, url);
    headers = replaceJobData(settings, job, headers);

    if (json) {
        json = replaceJobData(settings, job, json);
    }

    if (body) {
        body = replaceJobData(settings, job, body);
    }

    settings.logger.log(`[webhook] sending request to ${url}`);

    const response = await fetch(url, {
        method: method || 'POST',
        headers,
        body: json ? JSON.stringify(json) : body,
    });

    if (!response.ok) {
        settings.logger.log(`[webhook] request failed with status code ${response.status}`);
        return;
    }

    settings.logger.log(`[webhook] request successful with status code ${response.status}`);
}
