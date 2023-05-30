import { endent } from '@dword-design/functions'
import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import depcheck from 'depcheck'
import fs from 'fs-extra'
import outputFiles from 'output-files'

import self from './index.js'

export default tester(
  {
    'does not return duplicates': async () => {
      await outputFiles({
        'index.scss': endent`
          @import 'bar/foo';
          @import 'bar/bar';
        `,
        'node_modules/bar': {
          'bar.scss': '',
          'foo.scss': '',
        },
      })
      expect(self('index.scss')).toEqual(['bar'])
    },
    'does not return relative imports': async () => {
      await outputFiles({
        'foo.scss': '',
        'index.scss': endent`
          @import 'bar';

          @import './foo';
        `,
        'node_modules/bar': {
          'index.scss': '',
          'package.json': JSON.stringify({ main: 'index.scss' }),
        },
      })
      expect(self('index.scss')).toEqual(['bar'])
    },
    'sass import': async () => {
      await outputFiles({
        'foo.scss': '',
        'index.scss': endent`
          @import 'bar';

          @import './foo';
        `,
        'node_modules/bar': {
          'dist/index.scss': '',
          'package.json': JSON.stringify({ main: 'dist/index.scss' }),
        },
      })

      const result = await depcheck('.', {
        package: {
          dependencies: {
            bar: '^1.0.0',
          },
        },
        parsers: {
          '**/*.scss': self,
        },
      })
      expect(result.dependencies).toEqual([])
    },
    'subpath import commonjs': async () => {
      await outputFiles({
        'index.scss': "@import 'foo/sub'",
        'node_modules/foo': {
          'package.json': JSON.stringify({ type: 'commonjs' }),
          'sub.scss': '',
        },
      })

      const result = await depcheck('.', {
        package: {
          dependencies: {
            foo: '^1.0.0',
          },
        },
        parsers: {
          '**/*.scss': self,
        },
      })
      expect(result.dependencies).toEqual([])
    },
    'subpath import esm': async () => {
      await outputFiles({
        'index.scss': "@import 'foo/foo'",
        'node_modules/foo': {
          'bar.scss': '',
          'package.json': JSON.stringify({
            exports: { './foo': './bar.scss' },
          }),
        },
      })

      const result = await depcheck('.', {
        package: {
          dependencies: {
            foo: '^1.0.0',
          },
        },
        parsers: {
          '**/*.scss': self,
        },
      })
      expect(result.dependencies).toEqual([])
    },
    'underscore file': async () => {
      await fs.outputFile('_foo.scss', '$foo: $bar')

      const result = await depcheck('.', {
        package: {},
        parsers: {
          '**/*.scss': self,
        },
      })
      expect(result.invalidFiles).toEqual({})
    },
  },
  [testerPluginTmpDir()],
)
