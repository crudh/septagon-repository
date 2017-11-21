const { promisify } = require("util");

module.exports = {
  mkdirp: promisify(require("mkdirp")),
  stat: promisify(require("fs").stat),
  crypto: {
    randomBytes: promisify(require("crypto").randomBytes),
    pbkdf2: promisify(require("crypto").pbkdf2)
  }
};
