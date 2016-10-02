import config from 'config';
import es from 'event-stream';
import fs from 'fs';
import mkdirp from 'mkdirp';
import request from 'request';
import stream from 'stream';
import logger from 'winston';

const serverConfig = config.get('server');

class TarballReplacer extends stream.Transform {
  constructor() {
    super({ objectMode: true });

    const upstreamHost = serverConfig.upstream.replace(/https?:\/\//, '');
    this.upstreamRegExp = new RegExp(`https?:\/\/${upstreamHost}`, 'g');
  }

  _transform(line, encoding, done) {
    this.push(line.replace(this.upstreamRegExp, `${serverConfig.url}/npm/main`));
    done();
  }
}

const getFileName = (name, version) => version ? `${name}-${version}` : name;

const getUpstreamUrl = (name, version) => {
  const baseUrl = `${serverConfig.upstream}/${name}`;
  if (!version) return baseUrl;

  return `${baseUrl}/${version}`;
};

const checkPackageFile = (name, version, callback) => {
  const fileName = getFileName(name, version);
  fs.stat(`${serverConfig.storage}/${name}/${fileName}`, err => callback(err));
};

const streamPackage = (path, callback) => {
  const readStream = fs.createReadStream(path).pipe(es.split()).pipe(new TarballReplacer());
  callback(null, readStream);
};

export const getPackage = (name, version, callback) => {
  const fileName = getFileName(name, version);
  const directoryPath = `${serverConfig.storage}/${name}`;
  const filePath = `${directoryPath}/${fileName}`;

  return checkPackageFile(name, version, errFile => {
    if (!errFile) return streamPackage(filePath, callback);

    const req = request(getUpstreamUrl(name, version));
    req.pause();

    return req.on('error', errRequest => {
      logger.error(`Network error when fetching package ${name}@${version || ''} from upstream`);
      callback(errRequest);
    })
    .on('response', response => {
      const statusCode = response.statusCode;

      if (statusCode < 200 || statusCode >= 300) {
        const error = new Error(`Got ${statusCode} when fetching package from upstream`);
        error.statusCode = statusCode;
        return callback(error);
      }

      return mkdirp(directoryPath, errDir => {
        if (errDir) return callback(errDir);

        req.pipe(
          fs.createWriteStream(filePath)
            .on('error', errWrite => {
              logger.error(`Error when writing package ${name}@${version || ''} to storage`);
              callback(errWrite);
            })
            .on('finish', () => streamPackage(filePath, callback))
        );

        return req.resume();
      });
    });
  });
};
