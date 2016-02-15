'use strict';
const runner = require('./helpers/system-register-runner.js');

describe('it can handle default exports', () => {
    it(`doesn't fail`, (done) => {
        require('./default-export-string.js');

        const mainMod = runner.getMainModule();
        expect(mainMod.default).toBe('the-value-exported-from-default-export-string-module')

        setTimeout(done);
    });
});
