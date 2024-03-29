const config = require("config")
const request = require("request")
const logger = require("winston")
const { handleError } = require("../../common/api/errorHandling")
const distFileHandler = require("../handlers/distfile")
const packageHandler = require("../handlers/package")

const reposConfig = config.get("server.repos")

const getDistFile = (req, res) => {
  const repo = req.params.repo
  const name = req.params.name
  const distFile = req.params.distFile
  logger.info(`Fetching distfile for package ${name} (${req.originalUrl})`)

  return distFileHandler
    .getDistFile(reposConfig[repo], name, distFile)
    .then(stream => {
      res.set("Content-Type", "application/octet-stream")
      return stream.pipe(res)
    })
    .catch(error => {
      logger.error(
        `Error when fetching distfile ${distFile} for package ${name}`,
        error
      )
      return handleError(res, error)
    })
}

const getMainPackage = (req, res) => {
  const repo = req.params.repo
  const name = req.params.name
  logger.info(`Fetching package ${name} (${req.originalUrl})`)

  return packageHandler
    .getMainPackage(reposConfig[repo], name)
    .then(stream => {
      res.set("Content-Type", "application/json")
      return stream.pipe(res)
    })
    .catch(error => {
      logger.error(`Error when fetching package ${name}`, error)
      return handleError(res, error)
    })
}

const getVersionedPackage = (req, res) => {
  const repo = req.params.repo
  const name = req.params.name
  const version = req.params.version
  logger.info(`Fetching package ${name}@${version} (${req.originalUrl})`)

  return packageHandler
    .getVersionedPackage(reposConfig[repo], name, version)
    .then(stream => {
      res.set("Content-Type", "application/json")
      return stream.pipe(res)
    })
    .catch(error => {
      logger.error(`Error when fetching package ${name}@${version}`, error)
      return handleError(res, error)
    })
}

const searchPackage = (req, res) => {
  const repo = reposConfig[req.params.repo]

  return !repo.upstream
    ? handleError(res, { statusCode: 404 })
    : request(repo.upstream + req.url.replace(/^\/npm\/main/, "")).pipe(res)
}

module.exports = {
  getDistFile,
  getMainPackage,
  getVersionedPackage,
  searchPackage
}
