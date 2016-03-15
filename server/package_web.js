import { fetchPackage } from './fetch';
import { getPackage, putPackage } from './store';

const init = app => {
  app.get('/registry/main/:name', (req, res) => {
    const name = req.params.name;
    console.log(`----- ${name} - ${req.originalUrl}`);

    const fetchPackageCallback = (err, data) => {
      if (err) {
        res.status(500).send({ message: err });
      } else if (!data) {
        res.status(404).send({ message: 'Not found' });
      } else {
        putPackage(name, data);
        res.send(data);
      }
    };

    const getPackageCallback = (err, data) => {
      if (err) {
        fetchPackage(name, fetchPackageCallback);
      } else {
        res.send(data);
      }
    };

    getPackage(name, getPackageCallback);
  });
};

export default {
  init
};
