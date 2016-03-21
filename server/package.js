import es from 'event-stream';
import fs from 'fs';
import request from 'request';
import stream from 'stream';
import config from './config';

class TarballReplacer extends stream.Transform {
  constructor() {
    super({ objectMode: true });
  }

  _transform(line, encoding, done) {
    const re = /"tarball":\s?"([^"]*)"/g;
    const result = re.exec(line);
    if (result) {
      const tarballUrl = result[1];
      console.log(tarballUrl);
    }

    this.push(line);
    done();
  }
}

const getFileName = (name, version) => version ? `${name}-${version}` : name;

const getUpstreamUrl = (name, version) => {
  const baseUrl = `${config.upstream}/${name}`;
  if (!version) return baseUrl;

  return `${baseUrl}/${version}`;
};

const statPath = path => new Promise((resolve, reject) => {
  fs.stat(path, err => err ? reject(err) : resolve());
});

const createPackageDir = name => new Promise((resolve, reject) => {
  console.log(`* ${name} - store - creating package dir`);
  fs.mkdir(`${config.storage}/${name}`, err => err ? reject(err) : resolve());
});

export const fetchPackage = (name, version) => new Promise((resolve, reject) => {
  const packageDir = `${config.storage}/${name}`;
  const fileName = getFileName(name, version);
  const packageFilePath = `${packageDir}/${fileName}`;
  console.log(`* ${name} - store - fetching package`);

  statPath(packageDir)
    .catch(() => createPackageDir(name))
    .then(() => statPath(packageFilePath))
    .then(() => {
      const readStream = fs.createReadStream(packageFilePath);
      readStream.pipe(es.split()).pipe(new TarballReplacer());
      resolve(readStream);
    })
    .catch(() => {
      console.log(`* ${name} - store - package not available in store`);

      request(getUpstreamUrl(name, version))
        .on('error', err => {
          console.log(`* ${name} - store - network error when fetching package from upstream: ${err}`);
          reject(err);
        })
        .pipe(
          fs.createWriteStream(packageFilePath)
            .on('error', err => {
              console.log(`* ${name} - store - error when saving package to store: ${err}`);
              reject(err);
            })
            .on('finish', () => {
              const readStream = fs.createReadStream(packageFilePath);
              readStream.pipe(es.split()).pipe(new TarballReplacer());
              resolve(readStream);
            })
        );
    });
});
