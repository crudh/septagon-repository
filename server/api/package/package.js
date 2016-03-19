import { fetchPackage } from '../../store';

export const getPackageHandler = (req, res, name, version) => {
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
