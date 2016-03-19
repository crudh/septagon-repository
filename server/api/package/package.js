import { fetchPackage } from '../../fetch';
import { getPackage, putPackage } from '../../store';

export const getPackageHandler = (req, res, name, version) => {
  getPackage(name, version)
    .then(data => {
      console.log(`* ${name} - package_web - sending package to client`);
      res.send(data);
    })
    .catch(() => {
      fetchPackage(name, version)
        .then(data => {
          putPackage(name, data, version)
            .then(() => {
              console.log(`* ${name} - package_web - sending package to client`);
              res.send(data);
            })
            .catch(err => {
              console.log(`* ${name} - package_web - got an error when putting the package in the store: ${err}`);
              res.status(500).send({ message: 'internal error' });
            });
        })
        .catch(err => {
          const statusCode = (err && err.statusCode) || 500;
          console.log(`* ${name} - package_web - got an error when fetching package from upstream: ${err}`);
          res.status(statusCode).send({ message: 'error fetching package from upstream' });
        });
    });
};
