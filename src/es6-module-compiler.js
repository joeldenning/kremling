'use strict';
import * as exportParser from './export-parser.js';
import * as writer from './system-register.writer.js';

let blockDepth = 0;
const jsIdentifierRegex = /^[$A-Z_][0-9A-Z_$]*$/i;

function compile(string) {
    // console.log(string + '\n------------------------------------------\n')
    exportParser.reset(null, -1);
    handleCharacter(' ', 0);
    for (let i=0; i<string.length; i++) {
        handleCharacter(string[i], i);
    }

    return writer.toSystemRegister(string, exportParser.getParse());
}

function handleCharacter(char, i) {
    // process.stderr.write(char);
    exportParser.newCharacter(char, i);
}

if (exports) {
    // node
    exports.compile = compile;
} else if (typeof window !== 'undefined') {
    // browser
    window.es6ToSystemRegister = compile;
} else if (typeof self !== 'undefined') {
    self.es6ToSystemRegister = compile;
}
