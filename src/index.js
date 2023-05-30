import { compact, map, uniq } from '@dword-design/functions'
import getPackageName from 'get-package-name'
import P from 'path'
import resolveCwd from 'resolve-cwd'
import sass from 'sass'
import { fileURLToPath, pathToFileURL } from 'url'

export default filePath => {
  if (P.basename(filePath).startsWith('_')) {
    return []
  }

  const result = sass.compile(filePath, {
    importers: [{ findFileUrl: url => url |> resolveCwd |> pathToFileURL }],
  })

  return (
    result.loadedUrls
    |> map(url => fileURLToPath(url))
    |> map(importPath => getPackageName(importPath))
    |> compact
    |> uniq
  )
}
