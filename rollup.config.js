import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';

export default {
	entry: 'src/es6-module-compiler.js',
	dest: 'lib/es6-module-compiler.js',
	plugins: [
		nodeResolve({
			jsnext: true,
			main: true,
			skip: [
			],
		}),

		commonjs({
			include: 'node_modules/**',
		}),

		babel({
			presets: ['es2015-rollup'],
			plugins: ['transform-object-rest-spread'],
		}),
	],
	format: 'iife'
}
