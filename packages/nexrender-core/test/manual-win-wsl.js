const { init, render } = require('../src');
const job = require('./mywsljob.json');

const settings = {
    logger: console,
    skipCleanup: true,
    debug: true,
    wslMap: 'Z',
    // workpath: '/mnt/d/Downloads/tmp/nexrender'
}

// console.log(JSON.stringify(job))

render(job, init(settings)).then(job => {
    console.log('finished rendering', job)
}).catch(err => {
    console.error(err)
})