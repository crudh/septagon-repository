/* eslint no-console:0 */
import bodyParser from 'body-parser';
import express from 'express';
import fs from 'fs';
import { syncPackage } from './sync';

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
  console.log('***', req.originalUrl, name);

  if (!name) {
    res.status(404).send({ message: 'Not found' });
    console.log('* 404 - no name');
    return;
  }

  console.log('* reading file from fs: ', name);
  fs.readFile(`./tmp/${name}`, 'utf8', (err, data) => {
    if (err || !data) {
      console.log('* no local file found');

      syncPackage(name, (err, data) => {
        if (err) {
          res.status(500).send({ message: err });
          console.log('* 500 - err syncing package');
          return;
        }

        if (!data) {
          res.status(404).send({ message: 'Not found' });
          console.log('* 404 - no data while syncing');
          return;
        }

        res.send(data);
        return;
      });

      return;
    }

    res.send(data);
    return;
  });

});

app.listen(port, host, err => {
  if (err) {
    console.log(err);
    return;
  }

  console.log(`Server running in ${environment} mode (http://${host}:${port})`);
});
