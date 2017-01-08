const _forEach = require('lodash/fp/forEach');
const bodyParser = require('body-parser');
const config = require('config');
const express = require('express');
const mkdirp = require('mkdirp');
const logger = require('winston');
const routes = require('./routes');
const packagesApi = require('./api/packages_api');
const registryApi = require('./api/registry_api');

const env = process.env.NODE_ENV || 'development';
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3000;
const serverConfig = config.get('server');

logger.remove(logger.transports.Console);

if (serverConfig.log.console) {
  logger.add(logger.transports.Console, serverConfig.log.console);
}

if (serverConfig.log.file) {
  logger.add(logger.transports.File, serverConfig.log.file);
}

_forEach(repo => {
  mkdirp(repo.storage, err => {
    if (!err) return;

    logger.error(`Error when creating the storage directory (${serverConfig.storage})`, err);
    process.exit(1);
  });
})(serverConfig.repos);

const app = express();
app.set('env', env);

app.use(express.static('./public'));

routes(app, {
  package: packagesApi,
  registry: registryApi
});

app.use((req, res) => {
  logger.error(`Unhandled URL: ${req.url}`);
  res.status(404).send({ message: 'Not found' });
});

// This may conflict with the proxying using request with POST, there are several solutions
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(port, host, err => {
  if (err) {
    logger.error('Error in the web application', err);
    return;
  }

  logger.info(`Server running in ${env} mode (http://${host}:${port})`);
});

module.exports = {
  app
};
