import { fetchPackage } from './fetch';
import { getPackage, putPackage } from './store';

const init = app => {
  app.get('/registry/main/:name', (req, res) => {
    const name = req.params.name;
    console.log(`----- ${name} - ${req.originalUrl}`);

    getPackage(name)
      .then(data => {
        console.log(`* ${name} - package_web - sending package to client`);
        res.send(data);
      })
      .catch(() => {
        fetchPackage(name)
          .then(data => putPackage(name, data))
          .catch(err => {
            console.log(`* ${name} - package_web - failed to put package in store: ${err}`);
          })
          .then(data => {
            console.log(`* ${name} - package_web - sending package to client`);
            res.send(data);
          })
          .catch(err => {
            // TODO better error so we can send either 404 or 500?
            console.log(`* ${name} - package_web - got an error when fetching package from upstream`);
            res.status(500).send({ message: err });
          });
      });
  });
};

export default {
  init
};
