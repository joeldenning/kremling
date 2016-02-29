/* In terms of performance, I'm not as worried about excessive iteration here, but rather string
 * manipulation operations. Hence a more functional style.
 */

const nameOfDefaultExportVar = '$__default__export';

export function toSystemRegister(source, exportedThings, exportUpdates, importedThings) {
    let compiled = source;

    let mutationsToPerform = exportedThings
    .map((exportedThing) => ({...exportedThing, type: 'export_statement'}))
    .concat(exportUpdates.map(exportUpdate => ({...exportUpdate, type: 'export_update'})))
    .concat(importedThings.map(importedThing => ({...importedThing, type: 'import'})))
    .sort((first, second) => {
        // we want the indices to be from biggest to smallest so that mutations don't interfere with each other.
        return getRelevantIndex(second) - getRelevantIndex(first);
    });

    // console.dir(mutationsToPerform)

    mutationsToPerform
    .forEach((mutation) => {
        if (mutation.type === 'export_statement') {
            compiled = applyExportStatementMutation(compiled, mutation);
        } else if (mutation.type === 'export_update') {
            compiled = applyExportUpdateMutation(compiled, mutation);
        } else if (mutation.type === 'import') {
            compiled = applyImportMutation(compiled, mutation);
        } else {
            throw new Error(`Unknown mutation type '${mutation.type}'`);
        }
    });

    // console.dir('--------------------------------------------------------')

    const result =
`System.register([${importedModuleIdentifiers(importedThings)}], function($__export) {${importedVariables(importedThings)}
    return {
        setters: [${importedThings.map(importedThing => importSetter(importedThing))}
        ],
        execute: function() {
            ${compiled.replace(/\n/g, '\n            ')}
        }
    };
});`;

    return result;
}

function applyExportUpdateMutation(string, exportUpdate) {
    let exportedValue;
    if (exportUpdate.value) {
        exportedValue = exportUpdate.value;
    } else if (exportUpdate.name === 'default') {
        exportedValue = nameOfDefaultExportVar;
    } else {
        exportedValue = exportUpdate.name;
    }
    const mutation = `;$__export('${exportUpdate.name}', ${exportedValue});`;
    return string.substring(0, exportUpdate.insertionIndex + 1)
    + mutation
    + string.substring(exportUpdate.insertionIndex + 1)
}

function applyExportStatementMutation(string, exportedThing) {
    let result;

    if (exportedThing.isDefault && !exportedThing.name) {
        result = string.substring(0, exportedThing.startDelete)
            + `var ${nameOfDefaultExportVar} = `
            + string.substring(exportedThing.endDelete);
    } else {
        result = string.substring(0, exportedThing.startDelete)
            + string.substring(exportedThing.endDelete);
    }

    return result;
}

function applyImportMutation(string, importedThing) {
    return string.substring(0, importedThing.startIndex)
        + string.substring(importedThing.endIndex + 1);
}

function getRelevantIndex(mutation) {
    if (mutation.type === 'export_statement') {
        return mutation.endDelete;
    } else if (mutation.type === 'export_update') {
        return mutation.insertionIndex;
    } else if (mutation.type === 'import') {
        return mutation.endIndex;
    } else {
        throw new Error(`Unknown mutation type '${mutation.type}'`);
    }
}

function importedModuleIdentifiers(importedThings) {
    return importedThings
    .map(importedThing => "'" + importedThing.moduleIdentifier + "'")
    .join(', ');
}

function importedVariables(importedThings) {
    if (importedThings.length === 0) {
        return '';
    } else {
        return '\n    var ' +
        importedThings
        .map(importedThing => {
            return (importedThing.defaultImportName ? importedThing.defaultImportName : '')
                + importedThing.namedImports.map(namedImport => (namedImport.alias ? namedImport.alias : namedImport.name))
        })
        .join(', ')
        + ';';
    }
}

function importSetter(importedThing) {
    function defaultImportAssignment(importedThing) {
        return importedThing.defaultImportName ? `\n                ${importedThing.defaultImportName} = $__mod.default;` : '';
    }

    function namedImportAssignment(namedImport) {
        return `\n                ${namedImport.alias ? namedImport.alias : namedImport.name} = $__mod.${namedImport.name}`;
    }

    return `
            function($__mod) {${defaultImportAssignment(importedThing)}${importedThing.namedImports.map(namedImport => namedImportAssignment(namedImport))}
            },`
}
