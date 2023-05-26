import { compact, map, uniq } from '@dword-design/functions'
import getPackageName from 'get-package-name'
import resolveCwd from 'resolve-cwd'
import sass from 'sass'
import { pathToFileURL } from 'url'

export default path => {
  const result = sass.compile(path, {
    importers: [{ findFileUrl: url => url |> resolveCwd |> pathToFileURL }],
  })

  return (
    result.loadedUrls
    |> map(url => getPackageName(url.pathname))
    |> compact
    |> uniq
  )
}
