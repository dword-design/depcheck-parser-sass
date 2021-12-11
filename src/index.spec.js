import depcheck from 'depcheck'
import outputFiles from 'output-files'
import withLocalTmpDir from 'with-local-tmp-dir'

export default {
  'sass import': () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'node_modules/bar': {
          'dist/index.scss': '',
          'package.json': JSON.stringify({ main: 'dist/index.scss' }),
        },
        'src/index.scss': "@import '~bar';",
      })

      const self = require('.')

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
    }),
}
