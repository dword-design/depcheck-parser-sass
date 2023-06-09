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

  const dir = P.dirname(P.resolve(filePath))

  const result = sass.compile(filePath, {
    importers: [
      {
        findFileUrl: url => {
          try {
            return resolve(dir, url) |> pathToFileURL
          } catch (error) {
            const urlWithUnderscore = url
              .split('/')
              .map((segment, index, arr) =>
                index === arr.length - 1 ? `_${segment}` : segment,
              )
              .join('/')
            try {
              return resolve(dir, urlWithUnderscore) |> pathToFileURL
            } catch {
              throw error
            }
          }
        },
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
