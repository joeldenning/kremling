'use strict';
import * as exportParser from './export-parser.js';
import * as writer from './system-register.writer.js';
import * as exportUpdater from './export-updater.js';
import * as importParser from './import-parser.js';

/* In regards to performance, I worry about excessive iteration, which is why there is
 * a less functional and more imperative style.
 */
function compile(string) {
    if (typeof string !== 'string') {
        throw new Error(`Cannot compile a non-string '${typeof string}' -- '${string}'`);
    }
    // console.log(string + '\n------------------------------------------\n')
    exportParser.init();
    importParser.init();
    let currentLine = 1;
    let currentCharacterNumber = 1;
    for (let i=0; i<string.length; i++) {
        if (string[i] === '\n' || string[i] === '\r') {
            currentLine++;
            currentCharacterNumber = 1;
        } else {
            currentCharacterNumber++;
        }
        const errExports = exportParser.newCharacter(string[i], i);
        if (errExports) {
            throw new Error(`On line ${currentLine}, character ${currentCharacterNumber}: ${errExports.msg} -- "${string.substring(errExports.startIndex, errExports.endIndex).trim()}"`);
        }

        const errImports = importParser.newCharacter(string[i], i);
        if (errImports) {
            throw new Error(`On line ${currentLine}, character ${currentCharacterNumber}: ${errImports.msg} -- "${string.substring(errImports.startIndex, errImports.endIndex).trim()}"`);
        }
    }

    // console.log('\n----------------------------------------\n');

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

    // console.log('\n----------------------------------------\n');

    const exportUpdates = exportUpdater.getUpdates();
    const importedThings = importParser.getImports();

    return writer.toSystemRegister(string, exportsParse, exportUpdates, importedThings);
}

if (exports) {
    // node
    exports.compile = compile;
} else if (typeof window !== 'undefined') {
    // browser
    window.kremling = compile;
} else if (typeof self !== 'undefined') {
    self.kremling = compile;
}
