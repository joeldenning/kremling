'use strict';
const fs = require('fs');
const kremling = require(process.cwd() + '/lib/kremling.js');

const modules = {};

let nextModName;

global.System = {
    register: (depNames, func) => {
        // console.log('here');
        const modName = nextModName ? nextModName : 'ENTRY_MODULE';

        if (!modules[modName]) {
            modules[modName] = {};
        }

        const mod = func($__export);

        const depsExports = depNames.map((depName, index) => {
            nextModName = depName;

            let depIsLoaded;

            if (!modules[depName]) {
                modules[depName] = {};
                depIsLoaded = false;
            } else {
                depIsLoaded = true;
            }

            if (!modules[depName].dependents)
                modules[depName].dependents = [];

            modules[depName].dependents.push({
                name: modName,
                depIndex: index,
            });

            if (!depIsLoaded) {
                require('../' + depName);
            }

            // now that the dep is loaded
            mod.setters[index](modules[depName].exports);
        });

        const _exports = {};

        function $__export(key, value) {
            // console.log('exporting')
            // console.dir(key);
            // console.dir(value);
            const keyVals = {};
            if (typeof key === 'string') {
                keyVals[key] = value;
            }

            Object.assign(_exports, keyVals);
            // console.log(modName)
            modules[modName].dependents.forEach((dependent) => {
                // console.log('updating dependent')
                // console.log(dependent.name);
                if (modules[dependent.name].setters)
                    modules[dependent.name].setters[dependent.depIndex](_exports);
            });
        }

        Object.assign(modules[modName], {
            setters: mod.setters,
            exports: _exports,
        });

        if (!modules[modName].dependents) {
            modules[modName].dependents = [];
        }

        mod.execute();
    }
};

exports.import = function(filepath) {
    const entryFile = fs.readFileSync(filepath, 'utf8');
    const compiled = kremling.compile(entryFile);
    eval(compiled);

    return modules['ENTRY_MODULE'].exports
};
