/* eslint no-console:0 */
import express from 'express';
import bodyParser from 'body-parser';

const environment = process.env.NODE_ENV || 'development';
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3000;

const app = express();
app.set('env', environment);

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/services/*', (req, res) => {
  res.status(404).send({ message: 'Not found' });
});

app.listen(port, host, err => {
  if (err) {
    console.log(err);
    return;
  }

  console.log(`Server running in ${environment} mode (http://${host}:${port})`);
});
