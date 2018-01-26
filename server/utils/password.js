const { crypto } = require("./promisified")

const hashPassword = (
  password,
  salt,
  iterations = 10000,
  keyLength = 128,
  digest = "sha512"
) =>
  new Promise((resolve, reject) =>
    crypto
      .pbkdf2(password, salt, iterations, keyLength, digest)
      .then(hash => resolve(hash.toString("base64")))
      .catch(reject)
  )

const generateSalt = (length = 64) =>
  new Promise((resolve, reject) =>
    crypto
      .randomBytes(length)
      .then(salt => resolve(salt.toString("base64")))
      .catch(reject)
  )

module.exports = {
  hashPassword,
  generateSalt
}
