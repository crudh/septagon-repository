const config = require("config")
const user = require("../../npm/handlers/user")
const { getErrorMessage } = require("./errorHandling")

const usersConfig = config.has("server.users") ? config.get("server.users") : {}
const reposConfig = config.get("server.repos")

const validatorRepoExists = req =>
  new Promise(
    (resolve, reject) =>
      reposConfig[req.params.repo] ? resolve() : reject(404)
  )

const validatorRepoAuth = req =>
  new Promise((resolve, reject) => {
    const repo = req.params.repo
    const repoConfig = reposConfig[repo]
    const method = req.method

    if (method === "GET" && repoConfig.public) return resolve()

    const { name, password } = req.body
    if (!name || !password || !usersConfig[name]) return reject(401)
    if (!repoConfig.users || !repoConfig.users[name]) return reject(401)

    const userAccess = repoConfig.users[name]
    if (method !== "GET" && userAccess !== "write") return reject(401)

    return user
      .verifyPassword(name, password)
      .then(resolve)
      .catch(() => reject(401))
  })

const createValidation = (...validators) => api => (req, res) =>
  new Promise(resolve =>
    validators
      .reduce(
        (validatorChain, currentValidator) =>
          validatorChain.then(() => currentValidator(req, res)),
        Promise.resolve()
      )
      .then(() => resolve(api(req, res)))
      .catch(errorCode =>
        resolve(
          res.status(errorCode).send({ message: getErrorMessage(errorCode) })
        )
      )
  )

module.exports = {
  validatorRepoExists,
  validatorRepoAuth,
  createValidation
}
