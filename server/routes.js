const logger = require("winston")
const {
  createValidation,
  validatorRepository
} = require("./common/api/commonApi")
const npmPackagesAPI = require("./npm/api/packagesApi")
const npmRegistryAPI = require("./npm/api/registryApi")

const validate = createValidation(validatorRepository)

const unhandledUrl = (req, res) => {
  logger.error(`Unhandled URL: ${req.method} ${req.url}`)
  res.status(404).send({ message: "Not found" })
}

const routes = app => {
  app.get("/npm/-/ping", npmRegistryAPI.ping)
  app.put("/npm/-/user/org.couchdb.user\\::username", npmRegistryAPI.login)
  app.get("/npm/:repo", validate(npmRegistryAPI.getRegistryInfo))
  app.get("/npm/:repo/-/all*", validate(npmPackagesAPI.searchPackage))
  app.get("/npm/:repo/:name", validate(npmPackagesAPI.getMainPackage))
  app.get(
    "/npm/:repo/:name/:version",
    validate(npmPackagesAPI.getVersionedPackage)
  )
  app.get("/npm/:repo/:name/-/:distFile", validate(npmPackagesAPI.getDistFile))
  app.all("/npm/*", unhandledUrl)
}

module.exports = routes
