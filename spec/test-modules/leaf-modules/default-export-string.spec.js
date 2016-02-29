'use strict';
const runner = require(process.cwd() + '/spec/helpers/system-register-runner.js');

describe(`default-export-string.js`, () => {
    it(`exports a string`, () => {
        const sut = runner.import(__dirname + '/default-export-string.js');
        expect(sut.default).toBe('a string');
    });
});
