const { promisify } = require("util");

module.exports = {
  mkdirp: promisify(require("mkdirp")),
  stat: promisify(require("fs").stat)
};
