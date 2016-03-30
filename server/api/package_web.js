import { getPackage } from '../package';
import { handleError } from './api_util';

export const init = app => {
  app.get('/npm/main/:name/:version?', (req, res) => {
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
  });
};
