import def, { namedFunc } from 'spec/test-modules/leaf-modules/both-default-and-named-simple1.js';

export function getImportedVals() {
    return {
        def: def,
        namedFunc: namedFunc,
    };
}
