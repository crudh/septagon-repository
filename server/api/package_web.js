import { fetchPackage } from '../package';

const getPackageHandler = (req, res, name, version) => {
  fetchPackage(name, version)
    .then(readStream => {
      readStream.pipe(res);
    })
    .catch(err => {
      const statusCode = (err && err.statusCode) || 500;
      console.log(`* ${name} - package_web - got an error when getting the package from the store: ${err}`);
      res.status(statusCode).send({ message: 'internal error' });
    });
};

export const init = app => {
  app.get('/registry/main/:name', (req, res) => {
    const name = req.params.name;
    console.log(`----- ${name} - ${req.originalUrl}`);

    res.set('Content-Type', 'application/json');
    getPackageHandler(req, res, name);
  });

  app.get('/registry/main/:name/:version', (req, res) => {
    const name = req.params.name;
    const version = req.params.version;
    console.log(`----- ${name}@${version} - ${req.originalUrl}`);

    res.set('Content-Type', 'application/json');
    getPackageHandler(req, res, name, version);
  });
};
