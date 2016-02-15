'use strict';

System.register(['./leaf-modules/default-export-function.js'], ($__export) => {
    let dependentFunc, dependentString, numTimesNewValues = 0;

    return {
        setters: [
            (dep1) => {
                dependentFunc = dep1.default;
                if (++numTimesNewValues === 1) {
                    expect(dep1.changingValue).toBe('1');
                } else {
                    expect(dep1.changingValue).toBe('2');
                }
            }
        ],
        execute: () => {
            $__export('default', 'the-value-exported-from-default-export-string-module');
            expect(dependentFunc()).toBe('default-export-function return value when you call the func');
        },
    };
});
