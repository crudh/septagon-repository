import bodyParser from 'body-parser';
import express from 'express';
import * as packageWeb from './api/package_web';
import * as proxyWeb from './api/proxy_web';

const env = process.env.NODE_ENV || 'development';
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3000;

const app = express();
app.set('env', env);

packageWeb.init(app);
proxyWeb.init(app);

app.get('/registry/main', (req, res) => {
  res.send({ registry_name: 'main' });
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
