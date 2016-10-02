import config from 'config';
import fs from 'fs';
import mkdirp from 'mkdirp';
import request from 'request';
import logger from 'winston';

const serverConfig = config.get('server');

const streamDistFile = (name, distFile, callback) => {
  const readStream = fs.createReadStream(`${serverConfig.storage}/${name}/-/${distFile}`);
  callback(null, readStream);
};

const checkDistFile = (name, distFile, callback) => {
  fs.stat(`${serverConfig.storage}/${name}/-/${distFile}`, err => callback(err));
};

export const getDistFile = (name, distFile, callback) => {
  const directoryPath = `${serverConfig.storage}/${name}/-`;
  const filePath = `${directoryPath}/${distFile}`;

  return checkDistFile(name, distFile, errFile => {
    if (!errFile) return streamDistFile(name, distFile, callback);

    const req = request(`${serverConfig.upstream}/${name}/-/${distFile}`);
    req.pause();

    return req.on('error', errRequest => {
      logger.error(`Network error when fetching distfile ${distFile} for package ${name} from upstream`);
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
              logger.error(`Error when writing distfile ${distFile} for package ${name} to storage`);
              callback(errWrite);
            })
            .on('finish', () => streamDistFile(name, distFile, callback))
        );

        return req.resume();
      });
    });
  });
};