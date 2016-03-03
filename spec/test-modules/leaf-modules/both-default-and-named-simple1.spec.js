'use strict';
const runner = require(process.cwd() + '/spec/helpers/system-register-runner.js');

describe('both-default-and-named-simple1.js', () => {
    it('exports both a named export and a default export', () => {
        const sut = runner.import(__dirname + '/both-default-and-named-simple1.js');
        expect(sut.default).toBe('3');
        expect(sut.namedFunc()).toBe('twwett');
    });
});
