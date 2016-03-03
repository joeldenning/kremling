import { number, date, foo, bar } from 'spec/test-modules/leaf-modules/named-exports-simple1.js';

export function getImportedVals() {
    return {
        number: number,
        date: date,
        foo: foo,
        bar: bar,
    };
}
