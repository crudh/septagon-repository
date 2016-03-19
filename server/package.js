import fs from 'fs';
import request from 'request';
import config from './config';

const getFileName = (name, version) => version ? `${name}-${version}` : name;

const statPackageDir = name => new Promise((resolve, reject) => {
  console.log(`* ${name} - store - checking if package dir exists`);
  fs.stat(`${config.storage}/${name}`, err => err ? reject(err) : resolve());
});

const statPackageFile = (name, version) => new Promise((resolve, reject) => {
  const fileName = getFileName(name, version);
  console.log(`* ${name} - store - checking if package file exists`);
  fs.stat(`${config.storage}/${name}/${fileName}`, err => err ? reject(err) : resolve());
});

const createPackageDir = name => new Promise((resolve, reject) => {
  console.log(`* ${name} - store - creating package dir`);
  fs.mkdir(`${config.storage}/${name}`, err => err ? reject(err) : resolve());
});

export const fetchPackage = (name, version) => new Promise((resolve, reject) => {
  const fileName = getFileName(name, version);
  console.log(`* ${name} - store - fetching package`);

  statPackageDir(name)
    .catch(() => createPackageDir(name))
    .catch(err => {
      console.log(`* ${name} - store - failed to create package directory in store: ${err}`);
      reject(err);
    })
    .then(() => statPackageFile(name, version))
    .then(() => {
      const readStream = fs.createReadStream(`${config.storage}/${name}/${fileName}`);
      resolve(readStream);
    })
    .catch(() => {
      console.log(`* ${name} - store - package not available in store`);

      let url = `${config.upstream}/${name}`;
      if (version) {
        url += `/${version}`;
      }

      request(url)
        .on('error', err => {
          console.log(`* ${name} - store - network error when fetching package from upstream: ${err}`);
          reject(err);
        })
        .pipe(
          fs.createWriteStream(`${config.storage}/${name}/${fileName}`)
            .on('error', err => {
              console.log(`* ${name} - store - error when saving package to store: ${err}`);
              reject(err);
            })
            .on('finish', () => {
              const readStream = fs.createReadStream(`${config.storage}/${name}/${fileName}`);
              resolve(readStream);
            })
        );
    });
});
