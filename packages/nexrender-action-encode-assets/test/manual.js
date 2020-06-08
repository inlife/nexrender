const encode = require('../index')
// const { init, render } = require('../../nexrender-core/src')

const job = {
    uuid:"123",
    template: {
        src: 'file:///Users/inlife/Downloads/nexrender-boilerplate-master/assets/nm05ae12.aepx',
        composition: 'main',
        frameStart: 0,
        frameEnd: 500,
    },
    assets: [],
    actions: {
        prerender: [
          { module: __dirname + '/index.js',
          }
        ],
        postrender: [
            {
                module: '@nexrender/action-encode',
                output: 'output.mp4',
                preset: 'mp4',
            }
        ]
    },

    onChange: (job, state) => console.log('testing onChange:', state),
    onRenderProgress: (job, value) => console.log('testing onRenderProgress:', value)
}

const settings = {
    logger: console,
    skipCleanup: true,
    debug: true,
    workpath:"/Users/finnfrotscher/code/nexrender/packages/nexrender-action-encode-assets/test/tmp",
}


const options = {
  preset:'mp4',
  input:'*.mov',
  // ffmpeg: "ffmpeg/",
  params:{},
  output:'',

}

const test  = async () => {
  console.log('test', await encode(job, settings, options, 'prerender'))
}
test()


// render(job, init(settings)).then(job => {
//     console.log('finished rendering', job)
// }).catch(err => {
//     console.error(err)
// })
