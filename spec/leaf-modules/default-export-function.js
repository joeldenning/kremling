'use strict';
System.register([], ($__export) => {
    let _exports = {};
    Object.defineProperty(_exports, 'changingValue', {
        set: (val) => {
            $__export('changingValue', val);
        }
    })
    return {
        setters: [],
        execute: () => {
            $__export('default', function() {
                return 'default-export-function return value when you call the func';
            });

            _exports.changingValue = '1';

            setTimeout(() => _exports.changingValue = '2');
        },
    };
});
