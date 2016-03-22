import es from 'event-stream';
import fs from 'fs';
import mkdirp from 'mkdirp';
import request from 'request';
import stream from 'stream';
import config from './config';

class TarballReplacer extends stream.Transform {
  constructor() {
    super({ objectMode: true });

    const upstreamHost = config.upstream.replace(/https?:\/\//, '');
    this.upstreamRegExp = new RegExp(`https?:\/\/${upstreamHost}`, 'g');
  }

  _transform(line, encoding, done) {
    this.push(line.replace(this.upstreamRegExp, `${config.url}/npm/main`));
    done();
  }
}

const getFileName = (name, version) => version ? `${name}-${version}` : name;

const getUpstreamUrl = (name, version) => {
  const baseUrl = `${config.upstream}/${name}`;
  if (!version) return baseUrl;

  return `${baseUrl}/${version}`;
};

const checkPackageFile = (name, version, callback) => {
  const fileName = getFileName(name, version);
  fs.stat(`${config.storage}/${name}/${fileName}`, err => callback(err));
};

const streamPackage = (path, callback) => {
  const readStream = fs.createReadStream(path).pipe(es.split()).pipe(new TarballReplacer());
  callback(null, readStream);
};

export const getPackage = (name, version, callback) => {
  const fileName = getFileName(name, version);
  const filePath = `${config.storage}/${name}/${fileName}`;
  console.log(`* ${name} - store - fetching package`);

  return mkdirp(`${config.storage}/${name}`, errDir => {
    if (errDir) return callback(errDir);

    return checkPackageFile(name, version, errFile => {
      if (errFile) {
        return request(getUpstreamUrl(name, version))
          .on('error', errRequest => {
            console.log(`* ${name} - store - network error when fetching package from upstream: ${errRequest}`);
            return callback(errRequest);
          })
          .pipe(
            fs.createWriteStream(filePath)
              .on('error', errWrite => {
                console.log(`* ${name} - store - error when saving package to store: ${errWrite}`);
                return callback(errWrite);
              })
              .on('finish', () => streamPackage(filePath, callback))
          );
      }

      return streamPackage(filePath, callback);
    });
  });
};