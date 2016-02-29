/* Shadowed variables are our enemy
 */

let parenLevel,
    bracesLevel,
    currentWord,
    mostRecentDelimiter,
    thingsToExport = [],
    exportChanges = [],
    hasDefaultExport,
    endOfDefaultExport,
    addedDefaultExportMutation,
    nameOfDefaultExport;
    ;

export function init(exportsParse) {
    currentWord = '';
    resetWord([], null, -1);
    endOfStatement([], null, -1);
    parenLevel = 0;
    bracesLevel = 0;

    addedDefaultExportMutation = false;
    const defaultExports = exportsParse.filter(_export => _export.isDefault);
    if (defaultExports.length === 1) {
        hasDefaultExport = true;
        endOfDefaultExport = defaultExports[0].endDelete;
        nameOfDefaultExport = defaultExports[0].name;
    } else {
        hasDefaultExport = false;
        endOfDefaultExport = null;
    }
}

export function getUpdates() {
    return exportChanges;
}

/* In regards to performance, I worry about excessive iteration, which is why there is
 * a less functional and more imperative style.
 */
export function newCharacter(exportsParse, char, index) {
    currentWord += char;

    switch (char) {
        case '(':
            parenLevel++;
            resetWord(exportsParse, char, index);
        break;

        case ')':
            parenLevel--;
            resetWord(exportsParse, char, index);
        break;

        case ';':
            // what we really want from this if statement is if we're not inside of an expression or object literal
            if (bracesLevel === 0 && parenLevel === 0) {
                endOfStatement(exportsParse, char, index);
            } else {
                resetWord(exportsParse, char, index);
            }
        break;

        case '{':
            bracesLevel++;
            resetWord(exportsParse, char, index);
        break;
        case '}':
            bracesLevel--;
            resetWord(exportsParse, char, index);
        break;

        case '\n':
        case '\r':
            // what we really want from this if statement is if we're not inside of an expression or object literal
            if (bracesLevel === 0 && parenLevel === 0) {
                endOfStatement(exportsParse, char, index);
            } else {
                resetWord(exportsParse, char, index);
            }
        break;

        // the things that just reset the word
        case "'":
        case '=':
        case ':':
        case '-':
        case '+':
        case '/':
        case '^':
            resetWord(exportsParse, char, index)
        break;

        default:
            if (/\s/.test(char)) {
                resetWord(exportsParse, char, index);
            } else if (/[a-zA-z0-9]+/.test(char)) {
                // just let the current word accrue more letters
            } else {
                // console.log(`Unknown char ${char}`);
            }
        break;
    }
}

function resetWord(parse, char, index) {
    checkExportedThingsChanged(parse);

    // console.log(`resetting word -- '${currentWord}'`)
    currentWord = '';
}

function checkExportedThingsChanged(parse) {
    /* The current character is the one that caused this function to be called, so it should not count
     * as part of the current word
    */
    const relevantWord = currentWord.substring(0, currentWord.length - 1);
    // console.log(`check things changed -- '${relevantWord}'`);

    for (let i=0; i<parse.length; i++) {
        const nameOfExp = parse[i].name;
        if (nameOfExp === relevantWord) {
            thingsToExport.push(relevantWord);
        }
    }
}

function endOfStatement(parse, char, index) {
    resetWord(parse, char, index);

    if (char === '\n' || char === '\r') {
        //we want the export call on the same line as the mutation of the value (source mapping???)
        index--;
    }

    if (parenLevel === 0 && bracesLevel === 0 && hasDefaultExport && !addedDefaultExportMutation && index > endOfDefaultExport) {
        // console.log(`EXPORTING_____________ 'default'`)
        addedDefaultExportMutation = true;
        exportChanges.push({
            name: 'default',
            value: null, /* deduced by system-register-writer */
            insertionIndex: index,
        });
    }
    for (let i=0; i<thingsToExport.length; i++) {
        // console.log(`EXPORTING named export '${thingsToExport[i]}'`)
        let name = thingsToExport[i];
        if (hasDefaultExport && !addedDefaultExportMutation && index > endOfDefaultExport && nameOfDefaultExport === thingsToExport[i]) {
            addedDefaultExportMutation = true;
            name = 'default'
        }
        exportChanges.push({
            name,
            value: thingsToExport[i],
            insertionIndex: index,
        });
    }

    thingsToExport = [];
}
