import { compact, map, uniq } from '@dword-design/functions'
import getPackageName from 'get-package-name'
import resolveCwd from 'resolve-cwd'
import sass from 'sass'
import { fileURLToPath, pathToFileURL } from 'url'

export default filePath => {
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
