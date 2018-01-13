const config = require("config")
const { crypto } = require("../../utils/promisified")

const usersConfig = config.has("server.users") ? config.get("server.users") : {}

const hash = (
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

// const generateSalt = (length = 64) => new Promise((resolve, reject) =>
// crypto.randomBytes(length).then(resolve).catch(reject)

const verifyPassword = (username, password) =>
  new Promise((resolve, reject) => {
    const user = usersConfig[username]
    if (!user) return reject(new Error("User not found"))

    return hash(password, user.salt)
      .then(
        hash =>
          user.hash === hash ? resolve() : reject(new Error("Hash mismatch"))
      )
      .catch(reject)
  })

module.exports = {
  verifyPassword
}
