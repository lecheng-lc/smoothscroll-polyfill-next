import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import babel from 'rollup-plugin-babel'
import typescript from 'rollup-plugin-typescript'

export default {
  input: './src/index.ts',
  output: {
    file: 'dist/main.js',
    inlineDynamicImports: true,
    format: 'umd',
    name: 'scrollPolyfill',
    sourcemap: false,
  },
  plugins: [
    typescript(),
    resolve(),
    commonjs(),
    terser(),
    babel({
      exclude: 'node_modules/**'
    })
  ]
};
