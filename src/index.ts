import pathLib from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import enhancedResolve from 'enhanced-resolve';
import getPackageName from 'get-package-name';
import { compact, uniq } from 'lodash-es';
import sass from 'sass';

const resolve = enhancedResolve.create.sync({
  extensions: ['.scss', '.sass', '.css'],
});

export default (filePath: string) => {
  if (pathLib.basename(filePath).startsWith('_')) {
    return [];
  }

  const dir = pathLib.dirname(pathLib.resolve(filePath));

  const result = sass.compile(filePath, {
    importers: [
      {
        findFileUrl: url => {
          try {
            const resolvedPath = resolve(dir, url);

            if (resolvedPath === false) {
              return null;
            }

            return pathToFileURL(resolvedPath);
          } catch (error) {
            const urlWithUnderscore = url
              .split('/')
              .map((segment, index, arr) =>
                index === arr.length - 1 ? `_${segment}` : segment,
              )
              .join('/');

            try {
              const resolvedPath = resolve(dir, urlWithUnderscore);

              if (resolvedPath === false) {
                return null;
              }

              return pathToFileURL(resolvedPath);
            } catch {
              throw error;
            }
          }
        },
      },
    ],
  });

  return uniq(
    compact(
      result.loadedUrls
        .map(url => fileURLToPath(url))
        .map(importPath => getPackageName(importPath)),
    ),
  );
};
