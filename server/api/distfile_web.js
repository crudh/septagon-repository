import { getDistFile } from '../distfile';
import { handleError } from './api_util';

export const init = app => {
  app.get('/npm/main/:name/-/:distFile', (req, res) => {
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
  });
};
