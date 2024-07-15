const Globbie = require('../index')
const path = require('path')
const test = require('brittle')

process.chdir(path.join(__dirname, 'fixtures'))

test('match all js files', async (t) => {
  const g = new Globbie('**.js', true)
  const matches = g.match()

  t.alike(matches, [
    'rootfile-1.js',
    'rootfile-2.js',
    'rootfile-3.js',
    'subpath/subpathfile-1.js',
    'subpath/subpathfile-2.js',
    'subpath/subpathfile-3.js',
    'subpath/subsubpath/subsubpathfile-1.js',
    'subpath/subsubpath/subsubpathfile-2.js',
    'subpath/subsubpath/subsubpathfile-3.js'
  ])
})

test('match all js and ts files', async (t) => {
  const g = new Globbie('**/*.{js,ts}', true)
  const matches = g.match()

  t.alike(matches, [
    'rootfile-1.js',
    'rootfile-2.js',
    'rootfile-3.js',
    'rootfile-invalid.ts',
    'subpath/subpathfile-1.js',
    'subpath/subpathfile-2.js',
    'subpath/subpathfile-3.js',
    'subpath/subpathfile-invalid.ts',
    'subpath/subsubpath/subsubpathfile-1.js',
    'subpath/subsubpath/subsubpathfile-2.js',
    'subpath/subsubpath/subsubpathfile-3.js',
    'subpath/subsubpath/subsubpathfile-invalid.ts'
  ])
})

test('match only subpath js files', async (t) => {
  const g = new Globbie('subpath/**/*.js', true)
  const matches = g.match()

  t.alike(matches, [
    'subpath/subpathfile-1.js',
    'subpath/subpathfile-2.js',
    'subpath/subpathfile-3.js',
    'subpath/subsubpath/subsubpathfile-1.js',
    'subpath/subsubpath/subsubpathfile-2.js',
    'subpath/subsubpath/subsubpathfile-3.js'
  ])
})

test('match only subpath js files - dir set to subsubpath', async (t) => {
  const g = new Globbie('subpath/**/*.js', true)
  const matches = g.match('subpath/subsubpath')

  t.alike(matches, [
    'subpath/subsubpath/subsubpathfile-1.js',
    'subpath/subsubpath/subsubpathfile-2.js',
    'subpath/subsubpath/subsubpathfile-3.js'
  ])
})

test('async match all js files', async (t) => {
  const g = new Globbie('**.js')
  const matches = await g.match()
  t.alike(matches, [
    'rootfile-1.js',
    'rootfile-2.js',
    'rootfile-3.js',
    'subpath/subpathfile-1.js',
    'subpath/subpathfile-2.js',
    'subpath/subpathfile-3.js',
    'subpath/subsubpath/subsubpathfile-1.js',
    'subpath/subsubpath/subsubpathfile-2.js',
    'subpath/subsubpath/subsubpathfile-3.js'
  ])
})

test('async match all js and ts files', async (t) => {
  const g = new Globbie('**/*.{js,ts}')
  const matches = await g.match()

  t.alike(matches, [
    'rootfile-1.js',
    'rootfile-2.js',
    'rootfile-3.js',
    'rootfile-invalid.ts',
    'subpath/subpathfile-1.js',
    'subpath/subpathfile-2.js',
    'subpath/subpathfile-3.js',
    'subpath/subpathfile-invalid.ts',
    'subpath/subsubpath/subsubpathfile-1.js',
    'subpath/subsubpath/subsubpathfile-2.js',
    'subpath/subsubpath/subsubpathfile-3.js',
    'subpath/subsubpath/subsubpathfile-invalid.ts'
  ])
})

test('async match only subpath', async (t) => {
  const g = new Globbie('subpath/**/*.js')
  const matches = await g.match()

  t.alike(matches, [
    'subpath/subpathfile-1.js',
    'subpath/subpathfile-2.js',
    'subpath/subpathfile-3.js',
    'subpath/subsubpath/subsubpathfile-1.js',
    'subpath/subsubpath/subsubpathfile-2.js',
    'subpath/subsubpath/subsubpathfile-3.js'
  ])
})

test('async match only subpath js files - dir set to subsubpath', async (t) => {
  const g = new Globbie('subpath/**/*.js', true)
  const matches = g.match('subpath/subsubpath')

  t.alike(matches, [
    'subpath/subsubpath/subsubpathfile-1.js',
    'subpath/subsubpath/subsubpathfile-2.js',
    'subpath/subsubpath/subsubpathfile-3.js'
  ])
})
