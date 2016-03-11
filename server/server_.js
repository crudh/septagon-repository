/* eslint no-console:0 */
import bodyParser from 'body-parser';
import express from 'express';
import metadata from './metadata_web';

const environment = process.env.NODE_ENV || 'development';
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3000;

const app = express();
app.set('env', environment);

metadata.init(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(port, host, err => {
  if (err) {
    console.log(err);
    return;
  }

  console.log(`Server running in ${environment} mode (http://${host}:${port})`);
});
