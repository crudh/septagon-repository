import { fetchPackage } from '../../fetch';
import { getPackage, putPackage } from '../../store';

export const getPackageHandler = (req, res, name) => {
  getPackage(name)
    .then(data => {
      console.log(`* ${name} - package_web - sending package to client`);
      res.send(data);
    })
    .catch(() => {
      fetchPackage(name)
        .then(data => {
          putPackage(name, data)
            .then(() => {
              console.log(`* ${name} - package_web - sending package to client`);
              res.send(data);
            })
            .catch(err => {
              console.log(`* ${name} - package_web - got an error when sending package to client`);
              res.status(500).send({ message: err });
            });
        })
        .catch(err => {
          const statusCode = (err && err.statusCode) || 500;
          console.log(`* ${name} - package_web - got an error when fetching package from upstream (${statusCode})`);
          res.status(statusCode).send({ message: err });
        });
    });
};
