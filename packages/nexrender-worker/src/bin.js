#!/usr/bin/env node

const arg       = require('arg')
const chalk     = require('chalk')
const { init } = require('@nexrender/core')
const {start}   = require('./index')
const {version} = require('../package.json')
const rimraf    = require('rimraf')

const args = arg({
    // Types
    '--help':                   Boolean,
    '--version':                Boolean,
    '--cleanup':                Boolean,

    '--host':                   String,
    '--name':                   String,
    '--secret':                 String,

    '--binary':                 String,
    '--workpath':               String,
    '--wsl-map':                String,
    '--tag-selector':           String,
    '--cache':                  Boolean,
    '--cache-path':             String,

    '--stop-on-error':          Boolean,
    '--exit-on-empty-queue':    Boolean,
    '--tolerate-empty-queues':  Number,
    '--stop-at-time':           String,
    '--stop-days':              String,

    '--skip-cleanup':           Boolean,
    '--skip-render':            Boolean,
    '--no-license':             Boolean,
    '--no-analytics':           Boolean,
    '--force-patch':            Boolean,
    '--debug':                  Boolean,
    '--multi-frames':           Boolean,
    '--multi-frames-cpu':       Number,
    '--reuse':                  Boolean,

    '--max-memory-percent':     Number,
    '--image-cache-percent':    Number,
    '--polling':                Number,
    '--header':                 [String],

    '--aerender-parameter':     [String],
    '--language':               String,

    // Aliases
    '-v':           '--version',
    '-t':           '--tag-selector',
    '-c':           '--cleanup',
    '-h':           '--help',
    '-n':           '--name',
    '-s':           '--secret',
    '-b':           '--binary',
    '-w':           '--workpath',
    '-m':           '--wsl-map',
    '--ae':         '--aerender-parameter'
});

let serverHost = 'http://localhost:3000';
let serverSecret = '';

if (args['--help']) {
    console.error(chalk`
  {bold.cyan nexrender-worker} - nexrender render worker
  {bold.cyan version} - v${version}

  {bold USAGE}

      {bold $} {cyan nexrender-worker} --help
      {bold $} {cyan nexrender-worker} --version
      {bold $} {cyan nexrender-worker} --host=http://localhost:3000 --secret=mysecret

      By default {cyan nexrender-worker} will connect to {bold http://localhost:3000} and will
      start making api calls to fetch any existing queued project and start rendering those.

      Specifying {bold --secret} argument will enable the security validator, and will check
      for {bold nexrender-secret} header value for every outgoing request.

  {bold OPTIONS}

      -h, --help                            shows this help message

      -v, --version                         displays the current version of nexrender-worker

      -h, --host {underline \{scheme\}://\{domain/ip\}:\{port\}}
                                            specify which host {cyan nexrender-server} is running at,
                                            and where all api requests will be forwarded to

      -n, --name {underline unique_worker_name}
                                            specify which name the {cyan nexrender-worker} will have,
                                            and how it will be identified in the {cyan nexrender-server}

      -s, --secret {underline secret_string}            specify a secret that will be required for every
                                            incoming http request to validate again

      -b, --binary {underline absolute_path}            manually specify path to the {bold "aerender"} binary
                                            you can leave it empty to rely on autofinding

      -w, --workpath {underline absolute_path}          manually override path to the working directory
                                            by default nexrender is using os tmpdir/nexrender folder

      -m, --wsl-map                         drive letter of your WSL mapping in Windows

      -t, --tag-selector                    the string tags (comma delimited) to pickup the job with specific tag.

  {bold ADVANCED OPTIONS}


    --cache                                 Boolean flag that enables default HTTP caching of assets.
                                            Will save cache to [workpath]/http-cache unless "--cache-path is used"

    --cache-path                            String value that sets the HTTP cache path to the provided folder path.
                                            "--cache" will default to true if this is used.

    --stop-on-error                         forces worker to stop if processing/rendering error occures,
                                            otherwise worker will report an error, and continue working

    --exit-on-empty-queue                   worker will exit when too many empty queues (see --tolerate-empty-queues) have been detected.
                                            Useful when running on AWS EC2, to allow the instance to self-terminate and reduce compute costs

    --tolerate-empty-queues                 worker will check an empty queue this many times before exiting (if that option has
                                            been set using --exit-on-empty-queues). Defaults to zero. If specified will be used instead of
                                            NEXRENDER_TOLERATE_EMPTY_QUEUES env variable
                                            
    --stop-at-time                          worker will exit at the given time if given.
                                            example: 5:00 will stop at 5 am local time.  
    
    --stop-days                             comma separated list of weekdays when to stop. Must be used together with --stop-at-time
                                            0 is sunday, 6 is saturday
                                            example: --stop-at-time=5:00 stop-days=1,2,3,4,5
                                            will stop at 5 am but not on weekend                                          
                                            
    --no-license                            prevents creation of the ae_render_only_node.txt file (enabled by default),
                                            which allows free usage of trial version of Adobe After Effects

    --no-analytics                          prevents collection of fully anonymous analytics by nexrender (enabled by default),
                                            this data is used to improve nexrender and its features, read on what is collected in the readme

    --force-patch                           forces commandLineRenderer.jsx patch (re)installation

    --debug                                 enables command dump for aerender, and other debugging stuff

    --skip-cleanup                          forces worker to keep temporary data after rendering is finished

    --skip-render                           Skips rendering an output. Useful if you only want to call scripts

    --polling                               amount of miliseconds to wait before checking queued projects from the api,
                                            if specified will be used instead of NEXRENDER_API_POLLING env variable

    --header                                Define custom header that the worker will use to communicate with nexrender-server.
                                            Accepted format follows curl or wget request header definition,
                                            eg. --header="Some-Custom-Header: myCustomValue".

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
                                            
    --language                              language of local after effects installation. currently only en and de are supported                                        


  {bold ENV VARS}

      NEXRENDER_API_POLLING                 amount of miliseconds to wait before checking queued projects from the api

  {bold ENV EXAMPLE}

      {bold $} NEXRENDER_API_POLLING=1000 {cyan nexrender-worker}
`);
    process.exit(2);
}

if (args['--version']) {
    console.log(version);
    process.exit();
}

if (args['--host'])  {
    serverHost = args['--host'] || serverHost;
}

if (args['--secret']) {
    serverSecret = args['--secret'] || serverSecret;
}

console.log(chalk`> starting {bold.cyan nexrender-worker} endpoint {bold ${serverHost}}; using secret: {bold ${serverSecret ? 'yes' : 'no'}}`)

let settings = {};
const opt = (key, arg) => {if (args[arg]) {
    settings[key] = args[arg];
}}

/* backward compatibility */
if (settings.hasOwnProperty('ae-params')) {
    settings['aeParams'] = settings['ae-params']
}

opt('name',                 '--name');
opt('binary',               '--binary');
opt('workpath',             '--workpath');
opt('no-license',           '--no-license');
opt('no-analytics',         '--no-analytics');
opt('skipCleanup',          '--skip-cleanup');
opt('skipRender',           '--skip-render');
opt('forceCommandLinePatch','--force-patch');
opt('debug',                '--debug');
opt('multiFrames',          '--multi-frames');
opt('reuse',                '--reuse');
opt('stopOnError',          '--stop-on-error');
opt('tolerateEmptyQueues',  '--tolerate-empty-queues');
opt('exitOnEmptyQueue',     '--exit-on-empty-queue');
opt('stopAtTime',           '--stop-at-time');
opt('stopDays',             '--stop-days');
opt('maxMemoryPercent',     '--max-memory-percent');
opt('imageCachePercent',    '--image-cache-percent');
opt('polling',              '--polling');
opt('wslMap',               '--wsl-map');
opt('aeParams',             '--aerender-parameter');
opt('tagSelector',          '--tag-selector');
opt('language',             '--language');

if(args['--cache-path']){
    opt('cache', '--cache-path');
}else if(args['--cache']){
    opt('cache', '--cache');
}

if (args['--stop-on-error']) {
    settings['stopOnError'] = true;
} else {
    settings['stopOnError'] = false;
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

if (settings['no-license']) {
    settings.addLicense = false;
    delete settings['no-license'];
} else {
    settings.addLicense = true;
}

/* debug implies verbose */
// settings.verbose = settings.debug;

if (settings['no-analytics']) {
    settings.noAnalytics = true;
    delete settings['no-analytics'];
}

settings['process'] = 'nexrender-worker-cli';

const headers = {};
if (args['--header']){
    args['--header'].forEach((header) => {
        const [key, value] = header.split(":");

        // Only set header if both header key and value are defined
        if(key && value){
            headers[key.trim()] = value.trim();
        }
    });
}

start(serverHost, serverSecret, settings, headers);
