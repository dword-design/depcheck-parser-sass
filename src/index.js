import { compact, map, uniq } from '@dword-design/functions'
import enhancedResolve from 'enhanced-resolve'
import getPackageName from 'get-package-name'
import P from 'path'
import sass from 'sass'
import { fileURLToPath, pathToFileURL } from 'url'

const resolve = enhancedResolve.create.sync({
  extensions: ['.scss', '.sass', '.css'],
})

export default filePath => {
  if (P.basename(filePath).startsWith('_')) {
    return []
  }

  const result = sass.compile(filePath, {
    importers: [
      {
        findFileUrl: url =>
          resolve(P.dirname(P.resolve(filePath)), url) |> pathToFileURL,
      },
    ],
  })

  return (
    result.loadedUrls
    |> map(url => fileURLToPath(url))
    |> map(importPath => getPackageName(importPath))
    |> compact
    |> uniq
  )
}
