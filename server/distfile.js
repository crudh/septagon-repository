import fs from 'fs';
import mkdirp from 'mkdirp';
import request from 'request';
import config from './config';

const streamDistFile = (name, distFile, callback) => {
  const readStream = fs.createReadStream(`${config.storage}/${name}/-/${distFile}`);
  callback(null, readStream);
};

const checkDistFile = (name, distFile, callback) => {
  fs.stat(`${config.storage}/${name}/-/${distFile}`, err => callback(err));
};

export const getDistFile = (name, distFile, callback) => {
  const directoryPath = `${config.storage}/${name}/-`;
  const filePath = `${directoryPath}/${distFile}`;
  console.log(`* ${name} - store - fetching dist file`);

  return checkDistFile(name, distFile, errFile => {
    if (!errFile) return streamDistFile(name, distFile, callback);

    const req = request(`${config.upstream}/${name}/-/${distFile}`);
    req.pause();

    return req.on('error', errRequest => {
      console.log(`* ${name} - store - network error when fetching dist file from upstream: ${errRequest}`);
      callback(errRequest);
    })
    .on('response', response => {
      const statusCode = response.statusCode;

      if (statusCode < 200 || statusCode >= 300) {
        const error = new Error(`Got ${statusCode} when fetching dist file from upstream`);
        error.statusCode = statusCode;
        return callback(error);
      }

      return mkdirp(directoryPath, errDir => {
        if (errDir) return callback(errDir);

        req.pipe(
          fs.createWriteStream(filePath)
            .on('error', errWrite => {
              console.log(`* ${name} - store - error when saving dist file to store: ${errWrite}`);
              callback(errWrite);
            })
            .on('finish', () => streamDistFile(name, distFile, callback))
        );

        return req.resume();
      });
    });
  });
};
