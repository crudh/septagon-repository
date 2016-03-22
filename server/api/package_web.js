import { getPackage } from '../package';
import { getErrorMessage } from './api_util';

const getPackageHandler = (req, res, name, version) => {
  getPackage(name, version, (err, stream) => {
    if (err) {
      const statusCode = err.statusCode || 500;
      console.log(`* ${name} - package_web - got an error when getting the package from the store: ${err}`);
      return res.status(statusCode).send({ message: getErrorMessage(statusCode) });
    }

    return stream.pipe(res);
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
};
