const logger = require("winston")
const {
  createValidation,
  validatorRepoExists,
  validatorRepoAuth
} = require("./common/api/requestValidation")
const npmPackagesAPI = require("./npm/api/packagesApi")
const npmRegistryAPI = require("./npm/api/registryApi")

const validateRepo = createValidation(validatorRepoExists, validatorRepoAuth)

const unhandledUrl = (req, res) => {
  logger.error(`Unhandled URL: ${req.method} ${req.url}`)
  res.status(404).send({ message: "Not found" })
}

const routes = app => {
  app.get("/npm/-/ping", npmRegistryAPI.ping)
  app.put("/npm/-/user/org.couchdb.user\\::username", npmRegistryAPI.login)
  app.get("/npm/:repo", validateRepo(npmRegistryAPI.getRegistryInfo))
  app.get(
    "/npm/:repo/-/v1/search?*",
    validateRepo(npmPackagesAPI.searchPackage)
  )
  app.get("/npm/:repo/:name", validateRepo(npmPackagesAPI.getMainPackage))
  app.get(
    "/npm/:repo/:name/:version",
    validateRepo(npmPackagesAPI.getVersionedPackage)
  )
  app.get(
    "/npm/:repo/:name/-/:distFile",
    validateRepo(npmPackagesAPI.getDistFile)
  )
  app.all("/npm/*", unhandledUrl)
}

module.exports = routes
