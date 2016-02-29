let bracesLevel,
    parensLevel,
    currentWord,
    startIndex,
    endIndex,
    defaultImportName,
    namedImports,
    moduleIdentifier,
    moduleIdentifierDelimiter,
    imports,
    lookingFor;

const charsThatSimplyReset = [';', ',', ':'];

export function init() {
    bracesLevel = 0;
    parensLevel = 0;
    imports = [];
    resetWord();
    resetImport();
}

export function getImports() {
    return imports;
}

export function newCharacter(char, index) {
    currentWord += char;

    if (char === '{' && lookingFor !== 'IMPORTED_VARS') {
        bracesLevel++;
        resetWord();
    } else if (char === '}') {
        bracesLevel--;
        resetWord();
    } else if (char === '(') {
        parensLevel++;
        resetWord();
    } else if (charsThatSimplyReset.indexOf(char) >= 0) {
        resetWord();
    } else if (lookingFor === 'IMPORT_STATEMENT' && currentWord === 'import') {
        startIndex = index - 'import'.length;
        // console.log('looking for imported vars');
        lookingFor = 'IMPORTED_VARS';
        resetWord();
    } else if (lookingFor === 'IMPORTED_VARS') {
        if (char === ' ' || char === '\t') {
            resetWord();
        } else if (char === '{') {
            // console.log('looking for variable list');
            lookingFor = 'VARIABLE_LIST';
        } else {
            // console.log('looking for default import var name');
            resetWord();
            currentWord = char;
            lookingFor = 'DEFAULT_IMPORT_VAR_NAME';
        }
    } else if (char === ' ' || char === '\t') {
        if (lookingFor === 'DEFAULT_IMPORT_VAR_NAME') {
            // console.log('found default import name ' + currentWord);
            defaultImportName = currentWord.substring(0, currentWord.length - 1);
            resetWord();
            if (namedImports === null) {
                // console.log('looking for named imports')
                lookingFor = `NAMED_IMPORTS`;
            } else {
                // console.log('looking for ')
                lookingFor = `FROM_KEYWORD`;
            }
        }
    } else if (lookingFor === 'NAMED_IMPORTS') {
        if (char === 'f') {
            // console.log('looking for from keyword')
            lookingFor = 'FROM_KEYWORD';
        }
    } else if (lookingFor === 'FROM_KEYWORD') {
        if (currentWord === 'from') {
            // console.log('looking for string to begin module identifier')
            lookingFor = 'MODULE_IDENTIFIER_BEGINNING';
            resetWord();
        }
    } else if (lookingFor === 'MODULE_IDENTIFIER_BEGINNING') {
        if (char === ' ' || char === '\t') {
            resetWord();
        } else if (char === "'") {
            // console.log('looking for module identifier')
            moduleIdentifierDelimiter = "'";
            lookingFor = 'MODULE_IDENTIFIER';
            resetWord();
        } else if (char === '"') {
            // console.log('looking for module identifier')
            moduleIdentifierDelimiter = '"';
            lookingFor = 'MODULE_IDENTIFIER';
            resetWord();
        }
    } else if (char === moduleIdentifierDelimiter) {
        lookingFor = 'END_OF_STATEMENT';
        moduleIdentifier = currentWord.substring(0, currentWord.length - 1);
        // console.log('looking for end of statement')
    } else if (lookingFor === 'END_OF_STATEMENT') {
        if (!(char === ';' || /\s/.test(char))) {
            //we have reached the end of the import statement
            imports.push({
                moduleIdentifier,
                defaultImportName,
                namedImports: namedImports || [],
                startIndex,
                endIndex: index - 1,
            });
            // console.log(imports[imports.length - 1]);
            resetImport();
        }
    }
}

function resetWord() {
    // console.log(currentWord);
    currentWord = '';
}

function resetImport() {
    resetWord();
    startIndex = -1;
    endIndex = -1;
    defaultImportName = null;
    namedImports = null;
    lookingFor = 'IMPORT_STATEMENT';
    moduleIdentifierDelimiter = '';
    moduleIdentifier = '';
}
