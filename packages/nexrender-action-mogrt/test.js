const extension = require('./index.js');
const url = require('node:url');
const path = require('node:path');
const assert = require('assert');

describe("action/mogrt",() => {
    const defaultParameters = {
        job: {
            template: {
                src: url.pathToFileURL('./test/assets/ae.mogrt'),
                composition: 'Comp 1',
                dest: path.join(__dirname, './test/assets/ae.mogrt')
            },
            actions: {},
            assets: []
        },
        settings: {},
        options: {
            params: {
                foo: 'bar',
            }
        },
        type: 'predownload'
    }

    let parameters;

    beforeEach(async () => {
        const { temporaryDirectory } = await import('tempy');
        parameters = JSON.parse(JSON.stringify(defaultParameters));
        parameters.job.workpath = temporaryDirectory();
    })

    it('self-adds to postdownload', async () => {
        let job = await extension(...Object.values(parameters));

        assert(job.template.composition && job.template.composition === '__mogrt__');
        assert(job.actions.prerender);
        assert(job.actions.prerender[0].automaticallyAdded);
    });

    it('prerender phase', async () => {
        let job = await extension(...Object.values(parameters));
        parameters.type = 'prerender';
        parameters.options = job.actions.prerender[0];
        parameters.job.template.dest = path.join(__dirname, './test/assets/ae.mogrt');
        job = await extension(...Object.values(parameters));

        assert(job.template.composition && job.template.composition === '__mogrt__');
        assert(job.template.extension && job.template.extension === 'aep');
        assert(job.template.dest && job.template.dest.match(/test\.aep$/) !== null);
    })

    it('throws if added to postdownload', async () => {
        parameters.type = 'postdownload';
        try {
            await extension(...Object.values(parameters));
        }
        catch (e) {
            assert(e.message === "'action-mogrt-template' module should be used only in 'predownload' section");
        }
    });
})
