export function toSystemRegister(source, exportedThings, importedThings) {
    let compiled = source;

    exportedThings
    .reverse()
    .forEach((exportedThing) => {
        compiled = compiled.substring(0, exportedThing.startIndex)
        + '$__exported'
        + (exportedThing.isDefault ? '.default' : '')
        + ' ='
        + compiled.substring(exportedThing.endIndex);
    });

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
