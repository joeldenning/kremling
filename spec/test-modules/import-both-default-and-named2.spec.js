'use strict';
const runner = require(process.cwd() + '/spec/helpers/system-register-runner.js');

describe('import-both-default-and-named2.js', () => {
    it('can import both default and named variables from a module', () => {
        const sut = runner.import(__dirname + '/import-both-default-and-named2.js');
        expect(sut.getImportedVals().def).toBe('3');
        expect(sut.getImportedVals().namedFunc()).toBe('twwett');
    });
});
