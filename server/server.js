import bodyParser from 'body-parser';
import config from 'config';
import express from 'express';
import mkdirp from 'mkdirp';
import logger from 'winston';
import routes from './routes';
import * as packageHandlers from './api/packages_web';
import * as registryHandlers from './api/registry_web';

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

mkdirp(serverConfig.storage, err => {
  if (!err) return;

  logger.error(`Error when creating the storage directory (${serverConfig.storage})`, err);
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
