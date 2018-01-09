/* eslint no-console: "off" */
const config = require("config")
const express = require("express")
const logger = require("winston")
const routes = require("./routes")
const { mkdirp } = require("./utils/promisified")
const { validateServerConfig } = require("./utils/validateConfig")

const serverConfig = config.get("server")
const configErrors = validateServerConfig(serverConfig)
if (configErrors.length > 0) {
  console.error("There are configuration errors, the server will shut down:")
  console.error(configErrors)
  process.exit(1)
}

const host = serverConfig.location.host
const port = serverConfig.location.port
const env = process.env.NODE_ENV || "development"

logger.remove(logger.transports.Console)

if (serverConfig.log.console) {
  logger.add(logger.transports.Console, serverConfig.log.console)
}

if (serverConfig.log.file) {
  logger.add(logger.transports.File, serverConfig.log.file)
}

Object.values(serverConfig.repos).forEach(repo =>
  mkdirp(repo.storage)
    .then(() => mkdirp(`${repo.storage}/local`))
    .then(() => repo.upstream && mkdirp(`${repo.storage}/upstream`))
    .catch(error => {
      logger.error(
        `Error when creating the storage directory (${serverConfig.storage})`,
        error
      )
      process.exit(1)
    })
)

const app = express()
app.set("env", env)

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

routes(app)

app.all("*", (req, res) => {
  logger.error(`Unhandled URL: ${req.method} ${req.url}`)
  res.status(404).send({ message: "Not found" })
})

const server = app.listen(port, host, err => {
  if (err) {
    logger.error("Error in the web application", err)
    return
  }

  logger.info(`Server running in ${env} mode (http://${host}:${port})`)
})

module.exports = {
  app,
  server
}
