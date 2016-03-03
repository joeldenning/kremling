'use strict';
const runner = require(process.cwd() + '/spec/helpers/system-register-runner.js');

describe('simple-named-imports1.js', () => {
    it('successfully retrieves named imports from a leaf module', () => {
        const sut = runner.import(__dirname + '/simple-named-imports1.js');
        const importedVals = sut.getImportedVals();
        expect(importedVals.number).toBe(1);
        expect(importedVals.date instanceof Date).toBe(true);
        expect(importedVals.foo()).toBe('moofhu');
        expect(importedVals.bar()).toBe('basdfu');
    });
});

