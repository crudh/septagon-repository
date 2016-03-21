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

const checkAndSetupPackageDir = (name, callback) => {
  fs.stat(`${config.storage}/${name}`, errStat => {
    if (errStat) {
      return fs.mkdir(`${config.storage}/${name}`, errMkdir => callback(errMkdir));
    }

    return callback();
  });
};

const checkPackageFile = (name, version, callback) => {
  const fileName = getFileName(name, version);
  fs.stat(`${config.storage}/${name}/${fileName}`, err => callback(err));
};

const streamPackage = (path, callback) => {
  const readStream = fs.createReadStream(path);
  readStream.pipe(es.split()).pipe(new TarballReplacer());
  callback(null, readStream);
};

export const fetchPackage = (name, version, callback) => {
  const fileName = getFileName(name, version);
  const filePath = `${config.storage}/${name}/${fileName}`;
  console.log(`* ${name} - store - fetching package`);


  return checkAndSetupPackageDir(name, errDir => {
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
