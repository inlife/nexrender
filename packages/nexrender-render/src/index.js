const fs = require('fs')

module.exports = (project, settings) => {
    if (!project.prepare) {
        return Promise.reject('you should provide an instance of @nexrender/project')
    }

    if (!settings.binary || fs.existsSync(settings.binary)) {
        return Promise.reject('you should provide a proper path to After Effects\' \"aerender\" binary')
    }

    settings.multiframes    = settings.multiframes  || '';
    settings.memory         = settings.memory       || '';
    settings.log            = settings.log          || '';

    settings.workdir        = settings.workdir      || './temp';

    return project.prepare()
        .then(project => setup(project))
        .then(project => download(project))
        .then(project => rename(project))
        .then(project => filter(project))
        .then(project => patch(project))
        .then(project => render(project))
        .then(project => verify(project))
        .then(project => actions(project))
        .then(project => cleanup(project))
}
