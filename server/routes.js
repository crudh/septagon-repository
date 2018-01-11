const logger = require("winston")
const {
  createValidation,
  validatorRepoExists
} = require("./common/api/commonApi")
const npmPackagesAPI = require("./npm/api/packagesApi")
const npmRegistryAPI = require("./npm/api/registryApi")

const validateRepo = createValidation(validatorRepoExists)

const unhandledUrl = (req, res) => {
  logger.error(`Unhandled URL: ${req.method} ${req.url}`)
  res.status(404).send({ message: "Not found" })
}

const routes = app => {
  app.get("/npm/-/ping", npmRegistryAPI.ping)
  app.put("/npm/-/user/org.couchdb.user\\::username", npmRegistryAPI.login)
  app.get("/npm/:repo", validateRepo(npmRegistryAPI.getRegistryInfo))
  app.get("/npm/:repo/-/all*", validateRepo(npmPackagesAPI.searchPackage))
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
