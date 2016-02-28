'use strict';
const compiler = require('../lib/kremling.js');
const fs = require('fs');

const source = fs.readFileSync(process.argv[2], 'utf8');
const compiled = compiler.compile(source);
console.log(compiled);
