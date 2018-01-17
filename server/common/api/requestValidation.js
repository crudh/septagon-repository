const config = require("config")
const validateNpmPackageName = require("validate-npm-package-name")
const user = require("../../npm/handlers/user")
const { getBasicAuth } = require("../../utils/requestUtils")
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

    const { name, password } = getBasicAuth(req)
    if (!name || !password || !usersConfig[name]) return reject(401)
    if (!repoConfig.users || !repoConfig.users[name]) return reject(401)

    const userAccess = repoConfig.users[name]
    if (method !== "GET" && userAccess !== "write") return reject(401)

    return user
      .verifyPassword(name, password)
      .then(resolve)
      .catch(() => reject(401))
  })

const createValidatorNpmPackageName = (
  paramName,
  allowOldStyle = true
) => req =>
  new Promise((resolve, reject) => {
    const packageName = req.params[paramName]
    if (!packageName) return reject(400)

    const { validForNewPackages, validForOldPackages } = validateNpmPackageName(
      packageName
    )

    return validForNewPackages || (allowOldStyle && validForOldPackages)
      ? resolve()
      : reject(400)
  })

const addValidation = (validators, api) => (req, res) =>
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
  createValidatorNpmPackageName,
  addValidation
}
