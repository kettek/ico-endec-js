import * as path from 'path'
import { terser }  from 'rollup-plugin-terser'
import * as license from 'rollup-plugin-license'

export default {
  input: 'src/index.js',
  plugins: [
    terser(),
    license({
      banner: {
        content: {
          file: path.join(__dirname, 'LICENSE.md')
        }
      }
    })
  ],
  output: {
    file: 'dist/bundle.js',
    format: 'umd',
    name: 'icoEndec',
  }
}
