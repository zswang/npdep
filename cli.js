#!/usr/bin/env node

'use strict';
var npdep = require('./');
var optimist = require('optimist');
var fs = require('fs');
var path = require('path');
var util = require('util');
var colors = require('colors');

var argv = optimist
  .usage('$0 <input list>')

.alias('h', 'help')
  .describe('h', 'Show this help message and exit.')
  .string('h')

.alias('v', 'version')
  .describe('v', 'Print version number and exit.')

.alias('o', 'output')
  .describe('o', 'output file.')
  .string('o')

.alias('r', 'replace')
  .describe('r', 'replace file.')
  .boolean('r')

.wrap(80)
  .argv;

if (argv._.length < 1) {
  if (argv.version) {
    var json = require('./package.json');
    console.log(json.name + ' ' + json.version);
    return;
  }

  console.log(
    String(function () {
      /*
Usage:

    #{np,yellow}#{dep,blue} <input list> [options]

Options:

    #{-v, --version,cyan}                Output npdep version.
    #{-o, --output,cyan}                 Output file (default STDOUT)
    #{-r, --replace,cyan}                Replace file (default false)
      */
    })
    .replace(/[^]*\/\*!?\s*|\s*\*\/[^]*/g, '')
    .replace(/#\{(.*?),(\w+)\}/g, function (all, text, color) {
      return colors[color](text);
    })
  );
  return;
}

var contents = [];
var filenames = [];
argv._.forEach(function (filename) {
  filenames.push(filename);
  content = npdep.build(filename, argv);
  if (argv.r) {
    fs.writeFileSync(filename, content);
    console.log(
      colors.blue('File %j overwrite.'), filename
    );
  }
  contents.push(content);
});
var content = contents.join('\n');
if (argv.output) {
  mkdirp.sync(path.dirname(argv.output));
  fs.writeFileSync(argv.output, content);
  console.log(colors.green(util.format('%j npdep output complete.', filenames)));
}
else if (!argv.r) {
  console.log(content);
}