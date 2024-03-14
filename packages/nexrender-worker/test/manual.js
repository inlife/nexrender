process.env.NEXRENDER_API_POLLING = 1000
const {createWorker} = require('../src/instance')

const instance1 = createWorker()
const instance2 = createWorker()
const instance3 = createWorker()

setTimeout(() => instance1.start('https://localhost:3000', 'secret', {name: 'worker 1'}), 0)
setTimeout(() => instance2.start('https://localhost:3000', 'secret', {name: 'worker 2'}), 1000)
setTimeout(() => instance3.start('https://localhost:3000', 'secret', {name: 'worker 3'}), 2000)

setTimeout(() => instance1.stop(), 4000)
setTimeout(() => instance2.stop(), 5000)
setTimeout(() => instance3.stop(), 6000)
