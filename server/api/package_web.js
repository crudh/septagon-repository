import { fetchPackage } from '../package';

const getPackageHandler = (req, res, name, version) => {
  fetchPackage(name, version, (err, stream) => {
    if (err) {
      const statusCode = err.statusCode || 500;
      console.log(`* ${name} - package_web - got an error when getting the package from the store: ${err}`);
      res.status(statusCode).send({ message: 'internal error' });
    } else {
      stream.pipe(res);
    }
  });
};

export const init = app => {
  app.get('/npm/main/:name', (req, res) => {
    const name = req.params.name;
    console.log(`----- ${name} - ${req.originalUrl}`);

    res.set('Content-Type', 'application/json');
    getPackageHandler(req, res, name);
  });

  app.get('/npm/main/:name/:version', (req, res) => {
    const name = req.params.name;
    const version = req.params.version;
    console.log(`----- ${name}@${version} - ${req.originalUrl}`);

    res.set('Content-Type', 'application/json');
    getPackageHandler(req, res, name, version);
  });

  /* app.get('/npm/main/:name/-/:tarball', (req, res) => {

  });*/
};
