const _forEach = require('lodash/fp/forEach');
const bodyParser = require('body-parser');
const config = require('config');
const express = require('express');
const mkdirp = require('mkdirp');
const logger = require('winston');
const path = require('path');
const routes = require('./routes');

const serverConfig = config.get('server');

const host = serverConfig.location.host;
const port = serverConfig.location.port;
const env = process.env.NODE_ENV || 'development';

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
}, serverConfig.repos);

const app = express();
app.set('env', env);

app.use(express.static('./public'));

routes(app);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/../public/index.html'));
});

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
