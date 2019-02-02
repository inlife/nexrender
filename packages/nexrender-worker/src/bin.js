#!/usr/bin/env node

const arg       = require('arg')
const chalk     = require('chalk')
const {start}   = require('./index')
const {version} = require('../package.json')

const args = arg({
    // Types
    '--help':       Boolean,
    '--version':    Boolean,
    '--host':       String,
    '--secret':     String,

    '--binary':     String,
    '--workpath':   String,

    '--no-license':     Boolean,
    '--force-patch':    Boolean,
    '--render-logs':    Boolean,
    '--multi-frames':   Boolean,
    '--stop-on-error':  Boolean,

    '--max-memory-percent':  Number,
    '--image-cache-percent': Number,

    // Aliases
    '-v':           '--version',
    '-s':           '--secret',
    '-h':           '--help',
    '-b':           '--binary',
    '-w':           '--workpath',
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
                                            and where all api requests will be forwareded to

      -s, --secret {underline secret_string}            specify a secret that will be required for every
                                            incoming http request to validate again

      -b, --binary {underline absolute_path}            manually specify path to the {bold "aerender"} binary
                                            you can leave it empty to rely on autofinding

      -w, --workpath {underline absolute_path}          manually override path to the working directory
                                            by default nexrender is using os tmpdir/nexrender folder

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
    serverHost = args['--secret'] || serverHost;
}

if (args['--secret']) {
    serverSecret = args['--secret'] || serverSecret;
}

console.log(chalk`> starting {bold.cyan nexrender-worker} endpoint {bold ${serverHost}}; using secret: {bold ${serverSecret ? 'yes' : 'no'}}`)

let settings = {};
const opt = (key, arg) => {if (args[arg]) {
    settings[key] = args[arg];
}}

opt('binary',               '--binary');
opt('workpath',             '--workpath');
opt('no-license',           '--no-license');
opt('forceCommandLinePatch','--force-patch');
opt('renderLogs',           '--render-logs');
opt('multiFrames',          '--multi-frames');
opt('stopOnError',          '--stop-on-error');
opt('maxMemoryPercent',     '--max-memory-percent');
opt('imageCachePercent',    '--image-cache-percent');

if (settings['no-license']) {
    settings.addLicense = false;
    delete settings['no-license'];
}

start(serverHost, serverSecret, settings);
