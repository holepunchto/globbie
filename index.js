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
    const matches = []
    await Promise.all((await fs.promises.readdir(dir)).map(async f => {
      const p = path.join(dir, f)
      if ((await fs.promises.stat(p)).isDirectory()) matches.push(...await this.match(p))
      else if (this._isMatch(p)) matches.push(p)
    }))

    return matches
  }
}

module.exports = Globbie
