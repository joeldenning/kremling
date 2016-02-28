/* In regards to performance, I worry about excessive iteration, which is why there is
 * a less functional and more imperative style.
 */
let exportedThings,
    wordSoFar,
    startDelete,
    endDelete,
    isDefault,
    waitingFor,
    thenAfterThat,
    whitespaceOptional,
    foundWhitespace;

const identifierEndingChars = /[\s\(;=]/;
const endOfStatementRegex = /[\n}\);]/;

export function init() {
    reset('', -1);
    exportedThings = [];
    waitingFor = 'EXPORT_KEYWORD';
}

export function getParse() {
    return exportedThings;
}

export function newCharacter(char, index) {
    wordSoFar += char;
    // console.log(`"${wordSoFar}" -- ${waitingFor} -- ${char} -- ${index} -- ${startDelete}`)

    if (waitingFor === 'EXPORT_KEYWORD') {
        if (!('export'.startsWith(wordSoFar))) {
            // console.log(`"${wordSoFar}" isn't the export keyword`)
            reset(char, index);
        } else if ('export' === wordSoFar) {
            // console.log('\nfound export keyword')
            waitingFor = 'WHITESPACE';
            thenAfterThat = 'DEFAULT';
            wordSoFar = '';
        }
    } else if (waitingFor === 'DEFAULT') {
        if (!('default').startsWith(wordSoFar)) {
            // console.log(`"${wordSoFar}" isn't the default keyword`)
            waitingFor = 'TYPE';
        } else if ('default' === wordSoFar) {
            // console.log(`Found default keyword`)
            isDefault = true;
            waitingFor = 'WHITESPACE';
            thenAfterThat = 'TYPE';
            wordSoFar = '';
        }
    } else if (waitingFor === 'TYPE') {
        if ('function'.startsWith(wordSoFar)) {
            if ('function' === wordSoFar) {
                if (isDefault) {
                    // we don't need the name if it's default, because the name of the export is "default"
                    addNewExport(char, index, {
                        startDelete,
                        endDelete: index - 'function'.length,
                        isDefault,
                    });
                } else {
                    waitingFor = 'IDENTIFIER';
                    endDelete = index - wordSoFar.length + 1;
                    wordSoFar = '';
                }
            }
        } else if ('var'.startsWith(wordSoFar)) {
            if ('var' === wordSoFar) {
                waitingFor = 'IDENTIFIER';
                endDelete = index - wordSoFar.length + 1;
                wordSoFar = '';
            }
        } else if ('const'.startsWith(wordSoFar)) {
            if ('const' === wordSoFar) {
                waitingFor = 'IDENTIFIER';
                endDelete = index - wordSoFar.length + 1;
                wordSoFar = '';
            }
        } else if ('let'.startsWith(wordSoFar)) {
            if ('let' === wordSoFar) {
                waitingFor = 'IDENTIFIER';
                endDelete = index - wordSoFar.length + 1;
                wordSoFar = '';
            }
        } else if (isDefault) {
            // this is a default exported expression
            addNewExport(char, index, {
                startDelete,
                endDelete: index - wordSoFar.length,
                isDefault,
                name: null,
            })
        } else {
            return {
                msg: `Non default exports must have a name associated with them`,
                startDelete,
                endDelete: index,
            };
        }
    } else if (waitingFor === 'IDENTIFIER') {
        if (/^\s$/.test(wordSoFar)) {
            wordSoFar = '';
        } else if (identifierEndingChars.test(char)) {
            addNewExport(char, index, {
                startDelete,
                endDelete,
                isDefault,
                name: wordSoFar.substring(0, wordSoFar.length - 1),
            });
        }
    } else if (waitingFor === 'WHITESPACE') {
        wordSoFar = wordSoFar.replace(endOfStatementRegex, '');
        if ((/\s/.test(char))) {
            foundWhitespace = true;
        } else if (foundWhitespace) {
            // console.log(`"${char}" is not whitespace`)
            // console.log(`switching from whitespace to ${thenAfterThat}`);
            if (thenAfterThat === 'EXPORT_KEYWORD') {
                startDelete = index - wordSoFar.trim().length + 1;
            }
            waitingFor = thenAfterThat;
            thenAfterThat = null;
            foundWhitespace = false;
            wordSoFar = wordSoFar.trim();
        } else {
            if (whitespaceOptional) {
                if (thenAfterThat === 'EXPORT_KEYWORD') {
                    startDelete = index - wordSoFar.trim().length + 1;
                }
                waitingFor = thenAfterThat;
                thenAfterThat = null;
                foundWhitespace = false;
                wordSoFar = wordSoFar.trim();
            } else {
                reset(char, index);
            }
        }
    } else if (waitingFor === 'END_OF_STATEMENT') {
        if (endOfStatementRegex.test(wordSoFar)) {
            waitingFor = 'WHITESPACE';
            thenAfterThat = 'EXPORT_KEYWORD';
            wordSoFar = char;
            whitespaceOptional = true;
        } else {
            // console.log(`not end of statement = "${wordSoFar}"`)
        }
    } else {
        throw new Error(`Unknown export parse state -- waiting for "${waitingFor}"`);
    }
}

function reset(char, index) {
    waitingFor = 'END_OF_STATEMENT';
    whitespaceOptional = true;
    wordSoFar = char;
    startDelete = index + 1;
    isDefault = false;
    foundWhitespace = false;
    whitespaceOptional = false;
}

function addNewExport(char, index, opts) {
    // console.dir(opts);
    exportedThings.push(opts);
    reset(char, index);
}
