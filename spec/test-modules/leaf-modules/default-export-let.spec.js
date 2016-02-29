'use strict';
const runner = require(process.cwd() + '/spec/helpers/system-register-runner.js');

describe(`default-export-let.js`, () => {
    it(`exports a string as default`, () => {
        const sut = runner.import(__dirname + '/default-export-let.js');
        expect(sut.default).toBe('a previously defined value');
    });
});
