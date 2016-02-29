'use strict';
const runner = require(process.cwd() + '/spec/helpers/system-register-runner.js');

describe(`import-default-string.js`, () => {
    it('can import a string from a different file and return that value through a function', () => {
        const sut = runner.import(__dirname + '/import-default-string.js');
        expect(sut.strGetter()).toBe('a string');
    });
});
