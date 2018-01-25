/* eslint no-console: "off" */
const config = require("config")
const express = require("express")
const http = require("http")
const https = require("https")
const logger = require("winston")
const readFileSync = require("fs").readFileSync
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
const protocol = serverConfig.location.protocol
const httpsConfig = serverConfig.location.https || {}
const env = process.env.NODE_ENV || "development"

const serverOptions =
  protocol === "https"
    ? {
        key: readFileSync(httpsConfig.key),
        cert: readFileSync(httpsConfig.cert),
        ca: httpsConfig.ca ? readFileSync(httpsConfig.ca) : undefined,
        passphrase: httpsConfig.passphrase
      }
    : {}

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

const server =
  protocol === "http"
    ? http.createServer(app)
    : https.createServer(serverOptions, app)

server.listen(port, host, err => {
  if (err) {
    logger.error("Error in the web application", err)
    return
  }

  logger.info(`Server running in ${env} mode (${protocol}://${host}:${port})`)
})

module.exports = {
  app,
  server
}
