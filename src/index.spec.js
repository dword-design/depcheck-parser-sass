import { endent } from '@dword-design/functions'
import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import depcheck from 'depcheck'
import outputFiles from 'output-files'

import self from './index.js'

export default tester(
  {
    'does not return duplicates': async () => {
      await outputFiles({
        'foo.scss': '',
        'index.scss': endent`
          @import 'bar/foo.scss';
          @import 'bar/bar.scss';
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
  },
  [testerPluginTmpDir()],
)
