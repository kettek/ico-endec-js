import * as path from 'path'
import { terser }  from 'rollup-plugin-terser'
import * as license from 'rollup-plugin-license'

export default {
  input: 'src/index.js',
  plugins: [
    terser(),
    license({
      banner: {
        content: `This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.`,
      }
    })
  ],
  output: {
    file: 'dist/bundle.js',
    format: 'umd',
    name: 'icoEndec',
  }
}
