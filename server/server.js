const _toPairs = require("lodash/fp/toPairs");
const bodyParser = require("body-parser");
const config = require("config");
const express = require("express");
const mkdirp = require("mkdirp");
const logger = require("winston");
const path = require("path");
const routes = require("./routes");

const serverConfig = config.get("server");

const host = serverConfig.location.host;
const port = serverConfig.location.port;
const env = process.env.NODE_ENV || "development";

logger.remove(logger.transports.Console);

if (serverConfig.log.console) {
  logger.add(logger.transports.Console, serverConfig.log.console);
}

if (serverConfig.log.file) {
  logger.add(logger.transports.File, serverConfig.log.file);
}

_toPairs(serverConfig.repos).forEach(pair => {
  const [repoId, repo] = pair;

  if (repoId !== repo.id) {
    logger.error(`Repository config for ${repoId} has a missing or mismatching id (id should match the key)`);
    process.exit(1);
  }

  mkdirp(repo.storage, err => {
    if (!err) return;

    logger.error(`Error when creating the storage directory (${serverConfig.storage})`, err);
    process.exit(1);
  });
});

const app = express();
app.set("env", env);

app.use(express.static("./public"));

routes(app);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/../public/index.html"));
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = app.listen(port, host, err => {
  if (err) {
    logger.error("Error in the web application", err);
    return;
  }

  logger.info(`Server running in ${env} mode (http://${host}:${port})`);
});

module.exports = {
  app,
  server
};
