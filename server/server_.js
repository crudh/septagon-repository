import bodyParser from 'body-parser';
import express from 'express';
import mkdirp from 'mkdirp';
import config from './config';
import routes from './routes';
import * as packageHandlers from './api/package_web';
import * as registryHandlers from './api/registry_web';

const env = process.env.NODE_ENV || 'development';
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3000;

mkdirp(config.storage, err => {
  if (!err) return;

  console.error(err);
  process.exit(1);
});

const app = express();
app.set('env', env);

routes(app, {
  package: packageHandlers,
  registry: registryHandlers
});

app.use((req, res) => {
  console.log('*** catch all:', req.url);
  res.status(404).send({ message: 'Not found' });
});

// This may conflict with the proxying using request with POST, there are several solutions
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(port, host, err => {
  if (err) {
    console.log(err);
    return;
  }

  console.log(`Server running in ${env} mode (http://${host}:${port})`);
});

export default app;
