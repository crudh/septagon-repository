import { getDistFile } from '../distfile';
import { getErrorMessage } from './api_util';

export const init = app => {
  app.get('/npm/main/:name/-/:distFile', (req, res) => {
    const name = req.params.name;
    const distFile = req.params.distFile;
    console.log(`----- ${name} - ${req.originalUrl}`);

    getDistFile(name, distFile, (err, stream) => {
      if (err) {
        const statusCode = err.statusCode || 500;
        console.log(`* ${name} - package_web - got an error when getting the dist file from the store: ${err}`);

        res.set('Content-Type', 'application/json');
        return res.status(statusCode).send({ message: getErrorMessage(statusCode) });
      }

      return stream.pipe(res);
    });
  });
};
