import { compact, map, replace, uniq } from '@dword-design/functions'
import getPackageName from 'get-package-name'
import sass from 'node-sass'
import importer from 'node-sass-package-importer'
import P from 'path'
import requirePackageName from 'require-package-name'

export default filePath => {
  const result = sass.renderSync({
    file: filePath,
    importer: importer({ cwd: process.cwd() }),
  })

  return (
    result.stats.includedFiles
    |> map(
      path =>
        path[0] === '~'
          ? requirePackageName(path.substr(1))
          : getPackageName(path |> replace(/\//g, P.sep)) // fix node-sass incorrect path format for windows
    )
    |> compact
    |> uniq
  )
}
