'use strict';
const runner = require(process.cwd() + '/spec/helpers/system-register-runner.js');
const path = require('path');

describe('changing-exports-1', () => {
    it(`doesn't fail`, (done) => {
        const mod = runner.import(path.resolve(__dirname + '/default-export-const.js'));
        expect(mod.default.prop1()).toBe('prop1val');
        expect(mod.default.prop2).toBe('prop2val');
        expect(mod.default.prop3).toBe(null);

        setTimeout(done);
    });
});
