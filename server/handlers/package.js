import config from 'config';
import es from 'event-stream';
import fs from 'fs';
import mkdirp from 'mkdirp';
import request from 'request';
import stream from 'stream';
import logger from 'winston';

const serverConfig = config.get('server');

class TarballReplacer extends stream.Transform {
  constructor(repo) {
    super({ objectMode: true });

    const upstreamHost = repo.upstream.replace(/https?:\/\//, '');
    this.upstreamRegExp = new RegExp(`https?:\/\/${upstreamHost}`, 'g');
  }

  _transform(line, encoding, done) {
    this.push(line.replace(this.upstreamRegExp, `${serverConfig.url}/npm/main`));
    done();
  }
}

const getFileName = (name, version) => version ? `${name}-${version}` : name;

const getUpstreamUrl = (repo, name, version) => {
  const baseUrl = `${repo.upstream}/${name}`;
  if (!version) return baseUrl;

  return `${baseUrl}/${version}`;
};

const checkPackageFile = (repo, name, version, callback) => {
  const fileName = getFileName(name, version);
  fs.stat(`${repo.storage}/${name}/${fileName}`, err => callback(err));
};

const streamPackage = (repo, path, callback) => {
  const readStream = fs.createReadStream(path).pipe(es.split()).pipe(new TarballReplacer(repo));
  callback(null, readStream);
};

export const getPackage = (repo, name, version, callback) => {
  const fileName = getFileName(name, version);
  const directoryPath = `${repo.storage}/${name}`;
  const filePath = `${directoryPath}/${fileName}`;

  return checkPackageFile(repo, name, version, errFile => {
    if (!errFile) return streamPackage(repo, filePath, callback);

    const req = request(getUpstreamUrl(repo, name, version));
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
            .on('finish', () => streamPackage(repo, filePath, callback))
        );

        return req.resume();
      });
    });
  });
};
