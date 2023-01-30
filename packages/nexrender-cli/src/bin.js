#!/usr/bin/env node

const fs               = require('fs')
const arg              = require('arg')
const chalk            = require('chalk')
const {version}        = require('../package.json')
const {init, render}   = require('@nexrender/core')
const rimraf           = require('rimraf')

const args = arg({
    // Types
    '--help':       Boolean,
    '--version':    Boolean,
    '--cleanup':    Boolean,

    '--file':       String,
    '--binary':     String,
    '--workpath':   String,
    '--wsl-map':    String,
    '--cache':      Boolean,
    '--cache-path': String,

    '--stop-on-error':  Boolean,

    '--skip-cleanup':   Boolean,
    '--skip-render':    Boolean,
    '--no-license':     Boolean,
    '--force-patch':    Boolean,
    '--debug':          Boolean,
    '--multi-frames':   Boolean,
    '--multi-frames-cpu': Number,
    '--reuse':          Boolean,

    '--max-memory-percent':  Number,
    '--image-cache-percent': Number,

    '--aerender-parameter': [String],

    // Aliases
    '-v':           '--version',
    '-c':           '--cleanup',
    '-h':           '--help',
    '-f':           '--file',
    '-b':           '--binary',
    '-w':           '--workpath',
    '-m':           '--wsl-map',
    '--ae':         '--aerender-parameter'
});

// let serverHost = 'http://localhost:3000';
// let serverSecret = '';

if (args['--help']) {
    console.error(chalk`
  {bold.cyan nexrender-cli} - nexrender standalone renderer
  {bold.cyan version} - v${version}

  {bold USAGE}

      {bold $} {cyan nexrender-cli} {underline JOB_JSON} --help
      {bold $} {cyan nexrender-cli} {underline JOB_JSON} --version

      By default {cyan nexrender-cli} will connect to {bold http://localhost:3000} and will
      start making api calls to fetch any existing queued project and start rendering those.

      Specifying {bold --secret} argument will enable the security validator, and will check
      for {bold nexrender-secret} header value for every outgoing request.

  {bold OPTIONS}

      -h, --help                            shows this help message

      -v, --version                         displays the current version of nexrender-cli

      -c, --cleanup                         run cleanup, to remove all temporary data created by nexrender

      -f, --file {underline path}            instead of using json from argument, provide a relative
                                            or absolute path to file with json containing job

      -b, --binary {underline absolute_path}            manually specify path to the {bold "aerender"} binary
                                            you can leave it empty to rely on autofinding

      -w, --workpath {underline absolute_path}          manually override path to the working directory
                                            by default nexrender is using os tmpdir/nexrender folder

      -m, --wsl-map                         drive letter of your WSL mapping in Windows


  {bold ADVANCED OPTIONS}


    --cache                                 Boolean flag that enables default HTTP caching of assets.
                                            Will save cache to [workpath]/http-cache unless "--cache-path is used"

    --cache-path                            String value that sets the HTTP cache path to the provided folder path.
                                            "--cache" will default to true if this is used.

    --stop-on-error                         forces worker to stop if processing/rendering error occures,
                                            otherwise worker will report an error, and continue working

    --no-license                            prevents creation of the ae_render_only_node.txt file (enabled by default),
                                            which allows free usage of trial version of Adobe After Effects

    --force-patch                           forces commandLineRenderer.jsx patch (re)installation

    --debug                                 enables command dump for aerender, and other debugging stuff

    --skip-cleanup                          forces worker to keep temporary data after rendering is finished

    --skip-render                           Skips rendering an output. Useful if you only want to call scripts

    --multi-frames                          (from Adobe site): More processes may be created to render multiple frames simultaneously,
                                            depending on system configuration and preference settings.
                                            (See Memory & Multiprocessing preferences.)

    --max-memory-percent                    (from Adobe site): specifies the total percentage of memory that After Effects can use.
                                            For both values, if installed RAM is less than a given amount (n gigabytes),
                                            the value is a percentage of the installed RAM, and is otherwise a percentage of n.
                                            The value of n is 2 GB for 32-bit Windows, 4 GB for 64-bit Windows, and 3.5 GB for Mac OS.

    --image-cache-percent                   (from Adobe site): specifies the maximum percentage of memory used
                                            to cache already rendered images and footage.

    --reuse                                 (from Adobe site): Reuse the currently running instance of After Effects (if found) to
                                            perform the render. When an already running instance is used, aerender saves preferences
                                            to disk when rendering has completed, but does not quit After Effects. If this argument
                                            is not used, aerender starts a new instance of After Effects, even if one is already
                                            running. It quits that instance when rendering has completed, and does not save
                                            preferences.

    --aerender-parameter, --ae              forward parameter to aerender (see Adobe site). Parameters with arguments have to be
                                            enclosed in single quotes. For example:
                                            nexrender --aerender-parameter 'close SAVE_CHANGES' --ae 'i 10' job.json


  {bold ENV VARS}

      NEXRENDER_API_POLLING                 amount of miliseconds to wait before checking queued projects from the api

  {bold ENV EXAMPLE}

      {bold $} NEXRENDER_API_POLLING=1000 {cyan nexrender-cli}
`);
    process.exit(2);
}

if (args['--version']) {
    console.log(version);
    process.exit();
}

console.log(chalk`> starting {bold.cyan nexrender-cli}`)

let settings = {};
const opt = (key, arg) => {if (args[arg]) {
    settings[key] = args[arg];
}}

/* backward compatibility */
if (settings.hasOwnProperty('ae-params')) {
    settings['aeParams'] = settings['ae-params']
}

opt('binary',               '--binary');
opt('workpath',             '--workpath');
opt('no-license',           '--no-license');
opt('skipCleanup',          '--skip-cleanup');
opt('skipRender',           '--skip-render');
opt('forceCommandLinePatch','--force-patch');
opt('debug',                '--debug');
opt('multiFrames',          '--multi-frames');
opt('multiFramesCPU',       '--multi-frames-cpu');
opt('reuse',                '--reuse');
opt('stopOnError',          '--stop-on-error');
opt('maxMemoryPercent',     '--max-memory-percent');
opt('imageCachePercent',    '--image-cache-percent');
opt('wslMap',               '--wsl-map');
opt('aeParams',             '--aerender-parameter');

if(args['--cache-path']){
    opt('cache', '--cache-path');
}else if(args['--cache']){
    opt('cache', '--cache');
}

/* debug implies verbose */
settings.verbose = settings.debug;

if (settings['no-license']) {
    settings.addLicense = false;
    delete settings['no-license'];
}

if (args['--cleanup']) {
    settings = init(Object.assign(settings, {
        logger: console
    }))

    console.log('> running cleanup for a folder:', settings.workpath)

    /* run recursive rmdir */
    rimraf.sync(settings.workpath)

    console.log('> cleanup done')
    process.exit();
}

let json;

if (args['--file']) {
    json = fs.readFileSync(args['--file'], 'utf8')
} else {
    if (args._.length < 1) {
        console.error('you need to provide a nexrender job json as an argument');
        process.exit(1);
    } else {
        json = args._[0];
    }
}

let parsedJob;

try {
    parsedJob = JSON.parse(json)
} catch (err) {
    console.error('couldn\'t parse json job format, make sure your json is enclosed by \'quotes\'');
    console.error('provided json:', json);
    console.error(err);
    process.exit(1);
}

settings = init(Object.assign(settings, {
    logger: console
}))

render(parsedJob, settings)
    .then(() => {
        console.log('> job rendering successfully finished')
    })
    .catch(err => {
        console.error('> job rendering failed')
        console.error(err)
    })
