let exportedThings = [];
let exportState;
const exportKeywordRegexes = [/\s/, /e/, /x/, /p/, /o/, /r/, /t/, /[ \t]/];
const exportDefaultRegexes = [/d/, /e/, /f/, /a/, /u/, /l/, /t/, /[ \t]/];

export function newCharacter(char, index) {
    exportState.wordSoFar += char;
    if (exportState.waitingFor === 'EXPORT_KEYWORD') {
        if (!exportState.regex.test(char)) {
            reset(char, index);
        } else if (exportState.regexIndex < exportKeywordRegexes.length - 1) {
            exportState.regex = exportKeywordRegexes[++exportState.regexIndex];
        } else {
            // console.log('\nfound export keyword')
            exportState = {
                waitingFor: 'DEFAULT',
                regex: /./,
                regexIndex: 0,
                wordSoFar: '',
                startIndex: exportState.startIndex,
            };
        }
    } else if (exportState.waitingFor === 'DEFAULT') {
        if (exportState.regexIndex < exportDefaultRegexes.length - 1) {
            if (!exportDefaultRegexes[exportState.regexIndex++].test(char)) {
                addNewExport({
                    isDefault: false,
                    startIndex: exportState.startIndex,
                    endIndex: index,
                }, char, index);
            }
        } else {
            // console.log('\ndefault export')
            // console.log('\nlooking for type')
            addNewExport({
                isDefault: true,
                startIndex: exportState.startIndex,
                endIndex: index,
            }, char, index);
        }
    }
}

export function reset(char, index) {
    if (exportState) {
        // console.log('\nreseting export state, regex was ' + exportState.regex.toString())
    }
    exportState = {
        waitingFor: 'EXPORT_KEYWORD',
        regex: /\s/,
        regexIndex: 0,
        wordSoFar: '',
        isDefault: false,
        startIndex: index + 1,
    }
}

export function getParse() {
    return exportedThings;
}

function addNewExport(opts, char, index) {
    exportedThings.push(opts);
    reset(char, index);
}
