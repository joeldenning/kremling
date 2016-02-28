/* In terms of performance, I'm not as worried about excessive iteration here, but rather string
 * manipulation operations. Hence a more functional style.
 */

const nameOfDefaultExportVar = '$__default__export';

export function toSystemRegister(source, exportedThings, exportUpdates) {
    let compiled = source;

    let mutationsToPerform = exportedThings
    .map((exportedThing) => ({...exportedThing, type: 'export_statement'}))
    .concat(exportUpdates.map((exportUpdate) => ({...exportUpdate, type: 'export_update'})))
    .sort((first, second) => {
        // we want the indices to be from biggest to smallest so that mutations don't interfere with each other.
        return getRelevantIndex(second) - getRelevantIndex(first);
    });

    console.dir(mutationsToPerform)

    mutationsToPerform
    .forEach((mutation) => {
        if (mutation.type === 'export_statement') {
            compiled = applyExportStatementMutation(compiled, mutation);
        } else if (mutation.type === 'export_update') {
            compiled = applyExportUpdateMutation(compiled, mutation);
        } else {
            throw new Error(`Unknown mutation type '${mutation.type}'`);
        }
    });

    console.dir('--------------------------------------------------------')

    const result =
`System.register([], function($__export) {
    return {
        setters: [],
        execute: function() {
            ${compiled.replace(/\n/g, '\n            ')}
        }
    };
})`;

    return result;
}

function applyExportUpdateMutation(string, exportUpdate) {
    const mutation = `$__export('${exportUpdate.name}', ${exportUpdate.name === 'default' ? nameOfDefaultExportVar : exportUpdate.name});`;
    return string.substring(0, exportUpdate.insertionIndex + 1)
    + (string[exportUpdate.insertionIndex] === ';' ? '' : ';')
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

function getRelevantIndex(mutation) {
    if (mutation.type === 'export_statement') {
        return mutation.endDelete;
    } else if (mutation.type === 'export_update') {
        return mutation.insertionIndex;
    } else {
        throw new Error(`Unknown mutation type '${mutation.type}'`);
    }
}
