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
  console.log(`* ${name} - store - fetching dist file`);

  return mkdirp(`${config.storage}/${name}/-`, errDir => {
    if (errDir) return callback(errDir);

    return checkDistFile(name, distFile, errFile => {
      if (errFile) {
        return request(`${config.upstream}/${name}/-/${distFile}`)
          .on('error', errRequest => {
            console.log(`* ${name} - store - network error when fetching dist file from upstream: ${errRequest}`);
            return callback(errRequest);
          })
          .pipe(
            fs.createWriteStream(`${config.storage}/${name}/-/${distFile}`)
              .on('error', errWrite => {
                console.log(`* ${name} - store - error when saving dist file to store: ${errWrite}`);
                return callback(errWrite);
              })
              .on('finish', () => streamDistFile(name, distFile, callback))
          );
      }

      return streamDistFile(name, distFile, callback);
    });
  });
};
