const { promisify } = require("util")

module.exports = {
  mkdirp: promisify(require("mkdirp")),
  fs: {
    readFile: promisify(require("fs").readFile),
    stat: promisify(require("fs").stat),
    writeFile: promisify(require("fs").writeFile)
  },
  crypto: {
    randomBytes: promisify(require("crypto").randomBytes),
    pbkdf2: promisify(require("crypto").pbkdf2)
  }
}
