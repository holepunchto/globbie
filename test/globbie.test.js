const Globbie = require('../index')
const fs = require('fs')
const path = require('path')
const test = require('brittle')
const process = require('process')

process.chdir(path.join(__dirname, 'fixtures'))

function toPlatformPaths(paths) {
  return process.platform === 'win32' ? paths.map((p) => p.replace(/\//g, path.sep)) : paths
}

test('match all js files', async (t) => {
  const g = new Globbie('**.js', { sync: true })
  const matches = g.match()

  t.alike(
    matches.sort(),
    toPlatformPaths([
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
  )
})

test('match all js and ts files', async (t) => {
  const g = new Globbie('**/*.{js,ts}', { sync: true })
  const matches = g.match()

  t.alike(
    matches.sort(),
    toPlatformPaths([
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
  )
})

test('match only subpath js files', async (t) => {
  const g = new Globbie('subpath/**/*.js', { sync: true })
  const matches = g.match()

  t.alike(
    matches.sort(),
    toPlatformPaths([
      'subpath/subpathfile-1.js',
      'subpath/subpathfile-2.js',
      'subpath/subpathfile-3.js',
      'subpath/subsubpath/subsubpathfile-1.js',
      'subpath/subsubpath/subsubpathfile-2.js',
      'subpath/subsubpath/subsubpathfile-3.js'
    ])
  )
})

test('match only subpath js files - dir set to subsubpath', async (t) => {
  const g = new Globbie('subpath/**/*.js', { sync: true })
  const matches = g.match('subpath/subsubpath')

  t.alike(
    matches.sort(),
    toPlatformPaths([
      'subpath/subsubpath/subsubpathfile-1.js',
      'subpath/subsubpath/subsubpathfile-2.js',
      'subpath/subsubpath/subsubpathfile-3.js'
    ])
  )
})

test('async match all js files', async (t) => {
  const g = new Globbie('**.js')
  const matches = await g.match()
  t.alike(
    matches.sort(),
    toPlatformPaths([
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
  )
})

test('async match all js and ts files', async (t) => {
  const g = new Globbie('**/*.{js,ts}')
  const matches = await g.match()

  t.alike(
    matches.sort(),
    toPlatformPaths([
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
  )
})

test('async match only subpath', async (t) => {
  const g = new Globbie('subpath/**/*.js')
  const matches = await g.match()

  t.alike(
    matches.sort(),
    toPlatformPaths([
      'subpath/subpathfile-1.js',
      'subpath/subpathfile-2.js',
      'subpath/subpathfile-3.js',
      'subpath/subsubpath/subsubpathfile-1.js',
      'subpath/subsubpath/subsubpathfile-2.js',
      'subpath/subsubpath/subsubpathfile-3.js'
    ])
  )
})

test('async match only subpath js files - dir set to subsubpath', async (t) => {
  const g = new Globbie('subpath/**/*.js')
  const matches = await g.match('subpath/subsubpath')

  t.alike(
    matches.sort(),
    toPlatformPaths([
      'subpath/subsubpath/subsubpathfile-1.js',
      'subpath/subsubpath/subsubpathfile-2.js',
      'subpath/subsubpath/subsubpathfile-3.js'
    ])
  )
})

test('sync match tolerates a directory removed between readdir and lstat', async (t) => {
  // simulates ENOENT race: readdirSync lists a directory, but by the time
  // lstatSync gets to it, a concurrent process has deleted it
  const dirName = 'vanishing-dir'
  fs.mkdirSync(dirName)
  fs.writeFileSync(path.join(dirName, 'ghost.js'), '')

  const originalLstatSync = fs.lstatSync
  let removed = false
  fs.lstatSync = function (target, ...args) {
    if (!removed && target === dirName) {
      removed = true
      fs.rmSync(dirName, { recursive: true })
    }
    return originalLstatSync.call(fs, target, ...args)
  }
  t.teardown(() => {
    fs.lstatSync = originalLstatSync
    if (fs.existsSync(dirName)) fs.rmSync(dirName, { recursive: true })
  })

  const g = new Globbie('**.js', { sync: true })

  let matches = []
  t.execution(() => {
    matches = g.match()
  })
  t.ok(removed, 'the directory was actually removed mid-walk')
  t.absent(
    matches.includes(path.join(dirName, 'ghost.js')),
    'the vanished directory contributes no matches'
  )
})
