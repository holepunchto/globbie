const fs = require('fs')
const path = require('path')
const picomatch = require('picomatch')

class Globbie {
  constructor (pattern, { sync = false } = {}) {
    this._isMatch = picomatch(pattern, { windows: process.platform === 'win32' })
    this._sync = sync
  }

  match (dir = '.') {
    return this._sync ? this.#matchSync(dir) : this.#matchAsync(dir)
  }

  #matchSync (dir = '.') {
    const matches = []
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f)
      if (fs.statSync(p).isDirectory()) matches.push(...this.match(p))
      else if (this._isMatch(p)) matches.push(p)
    }

    return matches
  }

  async #matchAsync (dir = '.') {
    const files = await fs.promises.readdir(dir).catch((e) => {
      console.error('Failed to get files in directory', e)
      return []
    })
    const results = await Promise.allSettled(files.map(async f => {
      const p = path.join(dir, f)
      const stat = await fs.promises.stat(p).catch((e) => {
        console.error('Failed to get file stats', e)
        return null
      })
      if (!stat) return null

      if (stat.isDirectory()) return this.#matchAsync(p)
      else if (this._isMatch(p)) return [p]
      else return []
    }))

    return results.flatMap(r => r.status === 'fulfilled' ? r.value : []).filter((result) => result !== null)
  }
}

module.exports = Globbie
