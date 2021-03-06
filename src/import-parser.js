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

    if (lookingFor === 'IMPORT_STATEMENT') {
        if (char === '{' && lookingFor !== 'IMPORTED_VARS') {
            bracesLevel++;
            resetWord();
        } else if (char === '}') {
            bracesLevel--;
            resetWord();
        } else if (char === '(') {
            parensLevel++;
            resetWord();
        } else if (lookingFor === 'IMPORT_STATEMENT' && currentWord === 'import') {
            startIndex = index - 'import'.length;
            // console.log('looking for imported vars');
            lookingFor = 'IMPORTED_VARS';
            resetWord();
        }
    } else if (lookingFor === 'IMPORTED_VARS') {
        if (/\s/.test(char)) {
            resetWord();
        } else if (char === '{') {
            // console.log('looking for variable list');
            namedImports = [];
            lookingFor = 'VARIABLE_LIST';
            resetWord();
        } else {
            // console.log('looking for default import var name');
            resetWord();
            currentWord = char;
            lookingFor = 'DEFAULT_IMPORT_VAR_NAME';
        }
    } else if (lookingFor === 'DEFAULT_IMPORT_VAR_NAME') {
        if (/\s/.test(char) || char === ',') {
            // console.log(`found default import name '${currentWord}'`);
            defaultImportName = currentWord.substring(0, currentWord.length - 1);
            resetWord();
            if (namedImports === null) {
                // console.log('looking for named imports')
                lookingFor = `NAMED_IMPORTS`;
            } else {
                // console.log('looking for FROM_KEYWORD')
                lookingFor = `FROM_KEYWORD`;
            }
        }
    } else if (lookingFor === 'NAMED_IMPORTS') {
        if (char === '{') {
            namedImports = [];
            resetWord();
            lookingFor = 'VARIABLE_LIST';
        } else if (/\s/.test(char)) {
            resetWord();
        } else {
            lookingFor = 'FROM_KEYWORD';
        }
    } else if (lookingFor === 'VARIABLE_LIST') {
        if (/\s/.test(char)) {
            if (currentWord.length > 1) {
                // console.log(`looking for named imports comma, current word == ${currentWord}`);
                namedImports.push({
                    name: currentWord.trim(),
                });
                // console.dir(namedImports[namedImports.length - 1]);
                lookingFor = 'NAMED_IMPORTS_COMMA';
            }
            resetWord();
        } else if (char === '}') {
            // console.log('looking for from keyword');
            if (currentWord.length > 1) {
                namedImports.push({
                    name: currentWord.substring(0, currentWord - 1),
                });
                // console.dir(namedImports[namedImports.length - 1]);
            }
            resetWord();
            if (defaultImportName) {
                lookingFor = 'FROM_KEYWORD';
            } else {
                // console.log('looking for imported vars')
                lookingFor = 'IMPORTED_VARS';
            }
        } else if (char === ',') {
            // console.log('looking for named imports');
            if (currentWord.length > 1) {
                namedImports.push({
                    name: currentWord.substring(0, currentWord.length - 1),
                });
                // console.dir(namedImports[namedImports.length - 1]);
            }
            resetWord();
            lookingFor = 'VARIABLE_LIST';
        }
    } else if (lookingFor === 'NAMED_IMPORTS_COMMA') {
        if (char === ',') {
            // console.log('looking for named imports')
            lookingFor = 'NAMED_IMPORTS';
            resetWord();
        } else if (/\s/.test(char)) {
            resetWord();
        } else if (char === '}') {
            // console.log('looking for from keyword');
            if (currentWord.length > 1) {
                namedImports.push({
                    name: currentWord.substring(0, currentWord.length - 1),
                });
                // console.dir(namedImports[namedImports.length - 1]);
            }
            if (defaultImportName) {
                lookingFor = 'FROM_KEYWORD';
            } else {
                // console.log('looking for DEFAULT_IMPORT_COMMA ')
                lookingFor = 'DEFAULT_IMPORT_COMMA';
            }
            resetWord();
        } else {
            throw new Error(`Unexpected character while looking for NAMED_IMPORTS_COMMA -- '${char}'`)
        }
    } else if (lookingFor === 'DEFAULT_IMPORT_COMMA') {
        if (char === ',') {
            // console.log('looking for DEFAULT_IMPORT_VAR_NAME')
            lookingFor = 'DEFAULT_IMPORT_VAR_WHITESPACE';
            resetWord();
        } else if (/\s/.test(char)) {
            resetWord();
        } else {
            lookingFor = 'FROM_KEYWORD';
        }
    } else if (lookingFor === 'DEFAULT_IMPORT_VAR_WHITESPACE') {
        if (!(/\s/.test(char))) {
            lookingFor = 'DEFAULT_IMPORT_VAR_NAME';
        } else {
            resetWord();
        }
    } else if (lookingFor === 'FROM_KEYWORD') {
        if (currentWord === 'from') {
            // console.log('looking for string to begin module identifier')
            lookingFor = 'MODULE_IDENTIFIER_BEGINNING';
            resetWord();
        } else if (/\s/.test(char)) {
            resetWord();
        }
    } else if (lookingFor === 'MODULE_IDENTIFIER_BEGINNING') {
        if (/\s/.test(char)) {
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
    } else if (lookingFor === 'MODULE_IDENTIFIER'){
        // console.log(`module identifier '${currentWord}'`)
        if (char === moduleIdentifierDelimiter) {
            // console.log('looking for end of statement')
            lookingFor = 'END_OF_STATEMENT';
            moduleIdentifier = currentWord.substring(0, currentWord.length - 1);
        }
    } else if (lookingFor === 'END_OF_STATEMENT') {
        if (char === ';' || /[\n\r]/.test(char)) {
            const indexOffset = char === ';' ? 0 : -1;
            //we have reached the end of the import statement
            imports.push({
                moduleIdentifier,
                defaultImportName,
                namedImports: namedImports || [],
                startIndex,
                endIndex: index + indexOffset,
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
