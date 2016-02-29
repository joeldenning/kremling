'use strict';
const runner = require(process.cwd() + '/spec/helpers/system-register-runner.js');

describe(`default-export-object.js`, () => {
    it('can handle exporting an unnamed object that is neither a const, let, nor var', () => {
        const mod = runner.import(__dirname + '/default-export-object.js');
        expect(mod.default.prop1).toBe('string');
    });
});
