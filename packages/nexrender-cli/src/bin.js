#!/usr/bin/env node

const fs               = require('fs')
const arg              = require('arg')
const chalk            = require('chalk')
const {version}        = require('../package.json')
const { init, render } = require('@nexrender/core')

const args = arg({
    // Types
    '--help':       Boolean,
    '--version':    Boolean,

    '--file':       String,
    '--binary':     String,
    '--workpath':   String,

    '--stop-on-error':  String,

    '--skip-cleanup':   Boolean,
    '--no-license':     Boolean,
    '--force-patch':    Boolean,
    '--debug':          Boolean,
    '--multi-frames':   Boolean,
    '--reuse':          Boolean,

    '--max-memory-percent':  Number,
    '--image-cache-percent': Number,

    // Aliases
    '-v':           '--version',
    '-h':           '--help',
    '-f':           '--file',
    '-b':           '--binary',
    '-w':           '--workpath',
});

let serverHost = 'http://localhost:3000';
let serverSecret = '';

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

      -f, --file {underline path}            instead of using json from argument, provide a relative
                                            or absolute path to file with json containing job

      -b, --binary {underline absolute_path}            manually specify path to the {bold "aerender"} binary
                                            you can leave it empty to rely on autofinding

      -w, --workpath {underline absolute_path}          manually override path to the working directory
                                            by default nexrender is using os tmpdir/nexrender folder

  {bold ADVANCED OPTIONS}


    --stop-on-error                         forces worker to stop if processing/rendering error occures,
                                            otherwise worker will report an error, and continue working

    --no-license                            prevents creation of the ae_render_only_node.txt file (enabled by default),
                                            which allows free usage of trial version of Adobe After Effects

    --force-patch                           forces commandLineRenderer.jsx patch (re)installation

    --debug                                 enables command dump for aerender, and other debugging stuff

    --skip-cleanup                          forces worker to keep temporary data after rendering is finished

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

opt('binary',               '--binary');
opt('workpath',             '--workpath');
opt('no-license',           '--no-license');
opt('skipCleanup',          '--skip-cleanup');
opt('forceCommandLinePatch','--force-patch');
opt('debug',                '--debug');
opt('multiFrames',          '--multi-frames');
opt('reuse',                '--reuse');
opt('stopOnError',          '--stop-on-error');
opt('maxMemoryPercent',     '--max-memory-percent');
opt('imageCachePercent',    '--image-cache-percent');

/* convert string arugument into a boolean */
settings['stopOnError'] = settings['stopOnError'] == 'true';

if (settings['no-license']) {
    settings.addLicense = false;
    delete settings['no-license'];
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
    .then(job => {
        console.log('> job rendering successfully finished')
    })
    .catch(err => {
        console.error('> job rendering failed')
        console.error(err)
    })
