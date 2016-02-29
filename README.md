# kremling
The smallest, fastest es6 to System.register compiler you'll find. It's still experimental, see the issues for the features that are still lacking.

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
