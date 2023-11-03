module.exports = {  
    //loader: 'testdouble',
    //require: ['src/test/hooks.js', 'src/test/fixtures.js'],
    //parallel: true,
    jobs: 3,
    reporter: 'spec',
    timeout: '10000',
    spec: ['./**/src/**/*.spec.js'],
    global: ['expect', 'td', 'nock'],
    'check-leaks': true,
    bail: true
} 