const logger = require("winston")
const {
  addValidation,
  validatorRepoExists,
  validatorRepoAuth,
  createValidatorNpmPackageName,
  createValidatorFileName
} = require("./common/api/requestValidation")
const npmPackagesAPI = require("./npm/api/packagesApi")
const npmRegistryAPI = require("./npm/api/registryApi")

const unhandledUrl = (req, res) => {
  logger.error(`Unhandled URL: ${req.method} ${req.url}`)
  res.status(404).send({ message: "Not found" })
}

const routes = app => {
  app.get("/npm/-/ping", npmRegistryAPI.ping)
  app.put("/npm/-/user/org.couchdb.user\\::username", npmRegistryAPI.login)
  app.get(
    "/npm/:repo",
    addValidation(
      [validatorRepoExists, validatorRepoAuth],
      npmRegistryAPI.getRegistryInfo
    )
  )
  app.get(
    "/npm/:repo/-/v1/search?*",
    addValidation(
      [validatorRepoExists, validatorRepoAuth],
      npmPackagesAPI.searchPackage
    )
  )
  app.get(
    "/npm/:repo/:name",
    addValidation(
      [
        createValidatorNpmPackageName("name"),
        validatorRepoExists,
        validatorRepoAuth
      ],
      npmPackagesAPI.getMainPackage
    )
  )
  app.put(
    "/npm/:repo/:name",
    addValidation(
      [
        createValidatorNpmPackageName("name"),
        validatorRepoExists,
        validatorRepoAuth
      ],
      npmPackagesAPI.publishPackage
    )
    //npmPackagesAPI.publishPackage
  )
  app.get(
    "/npm/:repo/:name/:version",
    addValidation(
      [
        createValidatorNpmPackageName("name"),
        validatorRepoExists,
        validatorRepoAuth
      ],
      npmPackagesAPI.getVersionedPackage
    )
  )
  app.get(
    "/npm/:repo/:name/-/:distFile",
    addValidation(
      [
        createValidatorNpmPackageName("name"),
        createValidatorFileName("distFile"),
        validatorRepoExists,
        validatorRepoAuth
      ],
      npmPackagesAPI.getDistFile
    )
  )
  app.all("/npm/*", unhandledUrl)
}

module.exports = routes
