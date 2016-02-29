'use strict';
const runner = require(process.cwd() + '/spec/helpers/system-register-runner.js');

describe('default-export-var.js', () => {
    it(`exports a number`, () => {
        const mod = runner.import(__dirname + '/default-export-var.js');
        expect(mod.default).toBe(5);
    });
});
