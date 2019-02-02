const job = {
    uid: 'string',
    type: 'default',
    state: 'queued',
    workpath: '/absolute/path',
    resultname: 'movie.mov',
    output: '/absolute/path/movie.mov',
    scriptfile: '/absolute/path/script',

    template: {
        provider: 'http',
        src: 'http://fooo.bar/template.aepx',

        composition: 'main',

        frameStart: 0,
        frameEnd: 542,
        frameIncrement: 1,

        continueOnMissing: false,
        settingsTemplate: 'test',
        outputModule: 'test',
        outputExt: 'test',
    },
    assets: [
        {
            type: 'image',
            provider: 'http',
            src: 'http://fooo.bar/image.jpg',
            layer: 'logo.jpg',
        },
        {
            type: 'audio',
            provider: 'aws-s3',
            credentials: { key: 'XXXX-XX111XXX-XXXX' },
            src: 'http://fooo.bar/song.mp3',
            layer: 'audio.mp3',
        },
        {
            type: 'script',
            provider: 'http',
            src: 'http://fooo.bar/song.jsx',
        },
        {
            type: 'expression',
            provider: 'text',
            src: '"foo bar"',
            layer: 'author',
        }
    ],
    actions: {
        prerender: [
            { module: '@inlife/crop-images' },
        ],
        postrender: [
            {
                // upload original
                module: '@nexrender/action-upload',
                options: {
                    provider: 'aws-s3',
                    credentials: { key: 'XXXX-XX111XXX-XXXX' },
                    entry: {
                        darwin: 'result.mov',
                        win32: 'result.avi',
                    },
                }
            },
            {
                module: '@nexrender/action-ffmpeg',
                options: {
                    entry: {
                        darwin: 'result.mov',
                        win32: 'result.avi',
                    },
                    output: 'result.mp4',
                }
            },
            {
                // upload processed
                module: '@nexrender/action-upload',
                options: {
                    provider: 'youtube',
                    credentials: { key: 'XXXX-XX111XXX-XXXX' },
                    entry: 'result.mp4',
                }
            },
            {
                module: '@nexrender/action-webhook',
                options: {
                    success: 'http://example.com/api/render-callback',
                    failure: 'http://example.com/api/render-callback',
                    header: { 'Authorization: sometoken' }
                }
            }
        ]
    }
}
