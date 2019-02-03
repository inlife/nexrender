const job = {
    uid: 'string',
    type: 'default',
    state: 'queued',
    workpath: '/absolute/path',
    resultname: 'movie.mov',
    output: '/absolute/path/movie.mov',
    scriptfile: '/absolute/path/script',

    template: {
        src: 'https://fooo.bar/template.aep',
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
            src: 'http://fooo.bar/image.jpg',
            type: 'image',
            layer: 'logo.jpg',
        },
        {
            src: 's3://foobar/fooo.bar/song.mp3',
            type: 'audio',
            credentials: { Key: 'XXXX-XX111XXX-XXXX' },
            layer: 'audio.mp3',
        },
        {
            src: 'data:text/plain,wiggle(2)',
            type: 'expression',
            layer: 'author',
        },
        {
            src: 'ftp://test@fooo.bar:21/scripts/myscript.jsx',
            type: 'script',
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
                provider: 's3',
                credentials: { key: 'XXXX-XX111XXX-XXXX' },
                pattern: '*.(avi|mov)'
            },
            {
                module: '@nexrender/action-ffmpeg',
                output: 'result.mp4'
            },
            {
                // upload processed
                module: '@nexrender/action-upload',
                provider: 'youtube',
                credentials: { key: 'XXXX-XX111XXX-XXXX' },
                input: 'result.mp4'
            },
            {
                module: '@nexrender/action-webhook',
                success: 'http://example.com/api/render-callback',
                failure: 'http://example.com/api/render-callback',
                header: { 'Authorization: sometoken' }
            }
        ]
    }
}
