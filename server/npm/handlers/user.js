const config = require("config")
const { hashPassword } = require("../../utils/password")

const usersConfig = config.has("server.users") ? config.get("server.users") : {}

const verifyPassword = (username, password) =>
  new Promise((resolve, reject) => {
    const user = usersConfig[username]
    if (!user) return reject(new Error("User not found"))

    return hashPassword(password, user.salt)
      .then(
        hash =>
          user.hash === hash ? resolve() : reject(new Error("Hash mismatch"))
      )
      .catch(reject)
  })

module.exports = {
  verifyPassword
}
