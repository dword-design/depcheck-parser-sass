import pathLib from 'node:path';

import { expect, test } from '@playwright/test';
import depcheck from 'depcheck';
import endent from 'endent';
import fs from 'fs-extra';
import outputFiles from 'output-files';

import self from '.';

test('does not return duplicates', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'index.scss': endent`
      @import 'bar/foo';
      @import 'bar/bar';
    `,
    'node_modules/bar': { 'bar.scss': '', 'foo.scss': '' },
  });

  expect(await self(pathLib.join(cwd, 'index.scss'))).toEqual(['bar']);
});

test('does not return relative imports', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await outputFiles(cwd, { 'foo.scss': '', 'index.scss': "@import './foo';" });
  expect(await self(pathLib.join(cwd, 'index.scss'))).toEqual([]);
});

test('sass import', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'foo.scss': '',
    'index.scss': endent`
      @import 'bar';

      @import './foo';
    `,
    'node_modules/bar': {
      'dist/index.scss': '',
      'package.json': JSON.stringify({ main: 'dist/index.scss' }),
    },
  });

  const result = await depcheck(cwd, {
    package: { dependencies: { bar: '^1.0.0' } },
    parsers: { '**/*.scss': self },
  });

  expect(result.dependencies).toEqual([]);
});

test('subpath import', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'index.scss': "@import 'foo/sub'",
    'node_modules/foo/sub.scss': '',
  });

  const result = await depcheck(cwd, {
    package: { dependencies: { foo: '^1.0.0' } },
    parsers: { '**/*.scss': self },
  });

  expect(result.dependencies).toEqual([]);
});

test('subpath import esm', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'index.scss': "@import 'foo/foo'",
    'node_modules/foo': {
      'bar.scss': '',
      'package.json': JSON.stringify({ exports: { './foo': './bar.scss' } }),
    },
  });

  const result = await depcheck(cwd, {
    package: { dependencies: { foo: '^1.0.0' } },
    parsers: { '**/*.scss': self },
  });

  expect(result.dependencies).toEqual([]);
});

test('subpath underscore import', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'index.scss': "@import 'foo/sub'",
    'node_modules/foo': { '_sub.scss': '' },
  });

  const result = await depcheck(cwd, {
    package: { dependencies: { foo: '^1.0.0' } },
    parsers: { '**/*.scss': self },
  });

  expect(result.dependencies).toEqual([]);
});

test('_index.scss in sass subfolder (e.g. bulma)', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'index.scss'), '@import "bulma/sass";');

  const result = await depcheck(cwd, {
    package: {},
    parsers: { '**/*.scss': self },
  });

  expect(result.invalidFiles).toEqual({});
});
