# kremling
The smallest, fastest es6 module to [System.register](https://github.com/ModuleLoader/es6-module-loader/blob/master/docs/system-register.md) compiler you'll find. Kremling only compiles the `import` and `export` statements, it doesn't actually compile the rest of es6+ down to es5.

Salient features:
- 29K bundled, 5K bundled and gzipped, and if minified obviously would be even a bit smaller.
- No dependencies on any other javascript parser (babel, acorn, traceur, closure, etc).
- Can handle mutating exported values (which is really one of the trickiest parts of System.register syntax).

It's still experimental, see the issues for the features that are still lacking.

## Motivation 
Browser and Node support for es6 features is quickly catching up to the es6 spec, but since the [whatwg/loader spec for es6 modules](https://github.com/whatwg/loader) is not even complete yet, it's unlikely we'll soon see browser and node support for natively loading es6 modules with the `import` keyword. The community's current solution is either to precompile with babel or to runtime compile with babel. Runtime module compilation has some awesome advantages (see [systemjs](https://github.com/systemjs/systemjs)) and may someday overtake bundling as the community standard. However, the large footprint of babel in the browser is inhibitive for runtime module compilation to succeed. Thus, `kremling` was created to compile es6 modules at runtime in the browser without the large performance cost (both because of babel's sizeable `browser.js` over the network and babel's somewhat slow multi-pass/AST/plugin compilation method).

My hope is that, if kremling proves to be a feasible and reliable es6 -> System.register compiler, it would be adopted by the [es6-module-loader polyfill](https://github.com/ModuleLoader/es6-module-loader).

## Implementation method
Kremling is a look-ahead 0, two-pass compiler. In order to keep with the purpose of this project, no AST is created since that would require a re-implementation of babel, where all possible es6+ syntax would have to be fully understood. Instead, this project focuses on *compiling correct code correctly* over *validating that code is syntactically correct*. The hope is that a lot of syntax leniency will allow for myriad ecmascript features to pass through the compiler, without the compiler having to understand everything. Also, the lack of an AST keeps this project a lot smaller than babel / acorn / traceur / closure, which aligns with the goal of being used in the browser.

During the first pass, two distinct state machines are executed in order to parse what is imported and what is exported. During the second pass, another state machine is executed in order to determine where to put the `$__export('key', val)` statements in the code.

Other implementation decisions include:
- Favor excessive `$__export(...)`ing over missing an `$__export(...)` that is required for correctness.
- Be smart about understanding where functions start and stop, but don't try to understand everything in the function.

# Installation
```bash
npm install kremling
```
or, if you want the cli to always be available:
```bash
npm install -g kremling
```

# Usage

## As a CLI
```bash
kremling my-es6-module.js
```
The compiled es6 module will be printed to stdout.

## Javascript api
```js
import { compile } from 'kremling';
const compiledString = compile(`import path from 'path'`);
console.log(compiledString);
```

## Examples
[The tests](https://github.com/joeldenning/kremling/tree/master/spec/test-modules) are the best examples of what kremling can currently do. Also, the following es6 module :
```js
import fn, { namedExp1, namedExp2 } from './dep.js';

export default function() {
    return 'default-export-function return value when you call the func';
}
export let changingValue = '1';
changingValue = '2';

export let changingVal2 = {foo: 'bar'}
changingVal2 = {foo2: 'bar2'}

export function joel() {}
```

is compiled by kremling to:

```js
System.register(['./dep.js'], function($__export) {
    var fn, namedExp1,namedExp2;
    return {
        setters: [
            function($__mod) {
                fn = $__mod.default;
                namedExp1 = $__mod.namedExp1,
                namedExp2 = $__mod.namedExp2
            },
        ],
        execute: function() {


            var $__default__export =  function() {
                return 'default-export-function return value when you call the func';
            };$__export('default', $__default__export);
            let changingValue = '1';;$__export('changingValue', changingValue);
            changingValue = '2';;$__export('changingValue', changingValue);

            let changingVal2 = {foo: 'bar'};$__export('changingVal2', changingVal2);
            changingVal2 = {foo2: 'bar2'};$__export('changingVal2', changingVal2);

            function joel() {};$__export('joel', joel);

        }
    };
});
```

Note that there is still some polish to be done to the compiled output (too many semicolons, extra new line characters, etc), but that the code is *completely* valid and works with any implementation of System.register.
