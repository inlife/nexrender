process.env.NEXRENDER_API_POLLING = 500;

const { nextJob } = require('../src')

let i = 0;
const listJobs = async () => {
    console.log('listJobs')
    if (i++ > 5) {
        return [{state: 'queued'}]
    }
    return [];
}

const client = { listJobs }

const foo = async () => {
    const p = await nextJob(client)
    console.log('got job', p)
}

foo();
