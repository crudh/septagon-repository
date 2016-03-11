/* eslint no-console:0 */
import bodyParser from 'body-parser';
import express from 'express';
import fs from 'fs';
import { fetchMetadata } from './fetch';
import { getMetadata, saveMetadata } from './store';

const environment = process.env.NODE_ENV || 'development';
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3000;

const app = express();
app.set('env', environment);

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/:name', (req, res) => {
  const name = req.params.name;
  console.log(`----- ${name} - ${req.originalUrl}`);

  if (!name) {
    console.log('* no name - returning 404');
    res.status(404).send({ message: 'Not found' });
    return;
  }

  getMetadata(name, (err, data) => {
    if (data) {
      res.send(data);
      return;
    }

    console.log(`* ${name} - no metadata in storage`);
    fetchMetadata(name, (err, data) => {
      if (data) {
        saveMetadata(name, data);

        res.send(data);
        return;
      }

      if (err) {
        res.status(500).send({ message: err });
      } else {
        res.status(404).send({ message: 'Not found' });
      }
    });
  });
});

app.listen(port, host, err => {
  if (err) {
    console.log(err);
    return;
  }

  console.log(`Server running in ${environment} mode (http://${host}:${port})`);
});
