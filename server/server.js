import bodyParser from 'body-parser';
import express from 'express';
import mkdirp from 'mkdirp';
import logger from 'winston';
import routes from './routes';
import * as packageHandlers from './api/packages_web';
import * as registryHandlers from './api/registry_web';

const env = process.env.NODE_ENV || 'development';
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3000;
const configName = process.env.CONFIG || 'default';

export const config = require(`./config/${configName}`).default;

logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  level: config.logConsoleLevel
});

if (config.logFile) {
  logger.add(logger.transports.File, {
    filename: config.logFile,
    level: config.logFileLevel,
    handleExceptions: true,
    humanReadableUnhandledException: true
  });
}

mkdirp(config.storage, err => {
  if (!err) return;

  logger.error(`Error when creating the storage directory (${config.storage})`, err);
  process.exit(1);
});

export const app = express();
app.set('env', env);

routes(app, {
  package: packageHandlers,
  registry: registryHandlers
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
