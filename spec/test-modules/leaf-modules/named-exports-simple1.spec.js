'use strict';
const runner = require(process.cwd() + '/spec/helpers/system-register-runner.js');

describe('named-exports-simple1.js', () => {
    it(`exports several named values`, () => {
        const sut = runner.import(__dirname + '/named-exports-simple1.js');
        expect(sut.number).toBe(1);
        expect(sut.date instanceof Date).toBe(true);
        expect(sut.foo()).toBe('moofhu');
        expect(sut.bar()).toBe('basdfu');
    });
});
