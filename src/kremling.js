'use strict';
import * as exportParser from './export-parser.js';
import * as writer from './system-register.writer.js';
import * as exportUpdater from './export-updater.js';

let blockDepth = 0;
const jsIdentifierRegex = /^[$A-Z_][0-9A-Z_$]*$/i;

/* In regards to performance, I worry about excessive iteration, which is why there is
 * a less functional and more imperative style.
 */
function compile(string) {
    console.log(string + '\n------------------------------------------\n')
    exportParser.init();
    let currentLine = 1;
    let currentCharacterNumber = 1;
    for (let i=0; i<string.length; i++) {
        if (string[i] === '\n' || string[i] === '\r') {
            currentLine++;
            currentCharacterNumber = 1;
        } else {
            currentCharacterNumber++;
        }
        const err = exportParser.newCharacter(string[i], i);
        if (err) {
            throw new Error(`On line ${currentLine}, character ${currentCharacterNumber}: ${err.msg} -- "${string.substring(err.startIndex, err.endIndex).trim()}"`);
        }
    }

    console.log('\n----------------------------------------\n');

    const exportsParse = exportParser.getParse();

    currentLine = 1;
    currentCharacterNumber = 1;
    exportUpdater.init(exportsParse);
    for (let i=0; i<string.length; i++) {
        if (string[i] === '\n' || string[i] === '\r') {
            currentLine++;
            currentCharacterNumber = 1;
        } else {
            currentCharacterNumber++;
        }
        const err = exportUpdater.newCharacter(exportsParse, string[i], i);
        if (err) {
            throw new Error(`On line ${currentLine}, character ${currentCharacterNumber}: ${err.msg} -- "${string.substring(err.startIndex, err.endIndex).trim()}"`);
        }
    }

    console.log('\n----------------------------------------\n');

    const exportUpdates = exportUpdater.getUpdates();

    return writer.toSystemRegister(string, exportsParse, exportUpdates);
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
