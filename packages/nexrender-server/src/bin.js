#!/usr/bin/env node

const arg       = require('arg')
const chalk     = require('chalk')
const server    = require('./index')
const {version} = require('../package.json')

const args = arg({
    // Types
    '--help':    Boolean,
    '--version': Boolean,
    '--port':    Number,
    '--secret':  String,

    // Aliases
    '-v':        '--version',
    '-s':        '--secret',
    '-h':        '--help',
    '-p':        '--port',
});

let serverPort = 3000;
let serverSecret = '';

if (args['--help']) {
    console.error(chalk`
  {bold.cyan nexrender-server} - nexrender api server
  {bold.cyan version} - v${version}

  {bold USAGE}

      {bold $} {cyan nexrender-server} --help
      {bold $} {cyan nexrender-server} --version
      {bold $} {cyan nexrender-server} -p 3000 --secret=mysecret

      By default {cyan nexrender-server} will listen on {bold 0.0.0.0:3000} and will
      be serving the content without any security checks.

      Specifying {bold --secret} argument will enable the security validator, and will check
      for {bold nexrender-secret} header value for every incoming request.

  {bold OPTIONS}

      -h, --help                          shows this help message

      -v, --version                       displays the current version of nexrender-server

      -p, --port {underline port_number}              specify which port will be used to serve the data (3000 by default)

      -s, --secret {underline secret_string}          specify a secret that will be required for every incoming http request to validate against

  {bold ENV VARS}

      NEXRENDER_DATABASE                  providing value will override where the database file will be read from/written to.

  {bold ENV EXAMPLE}

      {bold $} NEXRENDER_DATABASE=/etc/nexrender/database.json {cyan nexrender-server} -p 3000
`);
    process.exit(2);
}

if (args['--version']) {
    console.log(version);
    process.exit();
}

if (args['--port'])  {
    const {isNaN} = Number;
    const port = Number(args['--port']);
    if (isNaN(port) || (!isNaN(port) && (port < 1 || port >= Math.pow(2, 16)))) {
        console.error(`Port option must be a number within allowed range. Supplied: ${args['--port']}`);
        process.exit(1);
    }

    serverPort = port || serverPort;
}

if (args['--secret']) {
    serverSecret = args['--secret'] || serverSecret;
}

console.log(chalk`> starting {bold.cyan nexrender-server} at {bold 0.0.0.0:${serverPort}}; using secret: {bold ${serverSecret ? 'yes' : 'no'}}`)

server.listen(serverPort, serverSecret)
