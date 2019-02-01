const templateSchema = {
    provider: '',
    credentials: {},
    src: '',

    uid: '',
    type: 'default',
    state: 'queued',

    composition: '',
    frameStart: 0,
    frameEnd: 0,

    outputModule: '',
    outputExt: '',
}

const assetSchema = {
    provider: '',
    credentials: {},
    src: '',

    type: '',
    layer: '',
}

const actionSchema = {
    module: '',
    provider: '',
    credentials: {},
    options: {},
}

const jobSchema = {
    template: templateSchema,
    assets: [ assetSchema ],
    actions: {
        prerender: [ actionSchema ],
        postrender: [ actionSchema ],
    }
}

const isValid = job => {

}

const createNew = options => {

}

module.exports = {
    isValid,
    createNew,
}
