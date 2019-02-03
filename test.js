'use strict'

const fs        = require('fs')
const path      = require('path')
const Mocha     = require('mocha')

const packages = fs.readdirSync('./packages')
const mocha    = new Mocha();

const tests = packages
    .map(p => path.join('packages', p, 'test', 'index.js'))
    .filter(p => fs.existsSync(p))

console.log('testing following packages:')
console.log(tests)

tests.map(file => mocha.addFile(file))
mocha.run(failures => process.exitCode = failures ? 1 : 0)
