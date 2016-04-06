import request from 'request';
import config from '../config';
import { getDistFile } from '../distfile';
import { getPackage } from '../package';

const getMessage = statusCode => {
  switch (statusCode) {
    case 404:
      return 'not found';
    default:
      return 'internal error';
  }
};

const handleError = (res, err) => {
  const statusCode = err.statusCode || 500;
  res.set('Content-Type', 'application/json');
  return res.status(statusCode).send({ message: getMessage(statusCode) });
};

export const fetchDistFile = (req, res) => {
  const name = req.params.name;
  const distFile = req.params.distFile;
  console.log(`----- ${name} - ${req.originalUrl}`);

  getDistFile(name, distFile, (err, stream) => {
    if (err) {
      console.log(`* ${name} - package_web - got an error when getting the dist file from the store: ${err}`);
      return handleError(res, err);
    }

    return stream.pipe(res);
  });
};

export const fetchPackage = (req, res) => {
  const name = req.params.name;
  const version = req.params.version;
  console.log(`----- ${name}@${version || ''} - ${req.originalUrl}`);

  getPackage(name, version, (err, stream) => {
    if (err) {
      console.log(`* ${name} - package_web - got an error when getting the package from the store: ${err}`);
      return handleError(res, err);
    }

    res.set('Content-Type', 'application/json');
    return stream.pipe(res);
  });
};

export const searchPackage = (req, res) => {
  req.pipe(request(config.upstream + req.url)).pipe(res);
};
