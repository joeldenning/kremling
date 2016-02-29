'use strict';
const runner = require(process.cwd() + '/spec/helpers/system-register-runner.js');

describe('changing-exports-1', () => {
    it(`doesn't fail`, () => {
        const mod = runner.import(__dirname + '/changing-exports-1.js');
        expect(mod.default()).toBe('default-export-function return value when you call the func');
        expect(mod.changingValue).toBe('2');
        expect(mod.changingVal2).toEqual({foo2: 'bar2'});
        try {
            mod.joel();
        } catch(ex) {
            expect(ex).toBe('joel should be a defined function');
        }
    });
});
