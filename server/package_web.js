import { fetchPackage } from './fetch';
import { getPackage, putPackage } from './store';

const init = app => {
  app.get('/:name', (req, res) => {
    const name = req.params.name;
    console.log(`----- ${name} - ${req.originalUrl}`);

    const fetchPackageCallback = (err, data) => {
      if (data) {
        putPackage(name, data);

        res.send(data);
        return;
      }

      if (err) {
        res.status(500).send({ message: err });
      } else {
        res.status(404).send({ message: 'Not found' });
      }
    };

    const getPackageCallback = (err, data) => {
      if (data) {
        res.send(data);
        return;
      }

      console.log(`* ${name} - no package in store`);
      fetchPackage(name, fetchPackageCallback);
    };

    getPackage(name, getPackageCallback);
  });
};

export default {
  init
};
