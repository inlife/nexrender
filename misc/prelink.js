const path       = require('path')
const pkg        = require(path.join(process.cwd(), 'package.json'))
const {execSync} = require('child_process')

console.log(`> linking all peer dependencies of ${pkg.name} as children to be prebuilt into binary...`)

Object.keys(pkg.peerDependencies).map(dep => {
    if (dep.indexOf('nexrender') !== -1) {
        const command = `npm link --no-package-lock --legacy-peer-deps ../${dep.replace('@nexrender/', 'nexrender-')}`
        console.log(`executing > ${command}`)
        execSync(command)
    }
})

