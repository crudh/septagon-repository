import fs from 'fs';
import config from './config';

// TODO fix error returns

const getFileName = (name, version) => {
  if (!version) return name;

  return `${name}-${version}`;
};

const statPackage = name => new Promise((resolve, reject) => {
  console.log(`* ${name} - store - checking if package dir exists`);
  fs.stat(`${config.storage}/${name}`, err => err ? reject(err) : resolve());
});

const readPackage = (name, version) => new Promise((resolve, reject) => {
  const fileName = getFileName(name, version);
  console.log(`* ${name} - store - reading package file ${fileName}`);
  fs.readFile(`${config.storage}/${name}/${fileName}`, 'utf8', (err, data) => err ? reject(err) : resolve(data));
});

const writePackage = (name, version, data) => new Promise((resolve, reject) => {
  const fileName = getFileName(name, version);
  console.log(`* ${name} - store - writing package file ${fileName}`);
  fs.writeFile(`${config.storage}/${name}/${fileName}`, data, 'utf8', err => err ? reject(err) : resolve());
});

const createPackageDir = name => new Promise((resolve, reject) => {
  console.log(`* ${name} - store - creating package dir`);
  fs.mkdir(`${config.storage}/${name}`, err => err ? reject(err) : resolve());
});

export const getPackage = (name, version) => new Promise((resolve, reject) => {
  const fileName = getFileName(name, version);
  console.log(`* ${name} - store - getting package file ${fileName} from store`);

  statPackage(name)
    .then(() => readPackage(name, version))
    .then(data => {
      console.log(`* ${name} - store - successfully got package file ${fileName} from store`);
      resolve(data);
    })
    .catch(err => {
      console.log(`* ${name} - store - package not available in store`);
      reject(err);
    });
});

export const putPackage = (name, data, version) => new Promise((resolve, reject) => {
  const fileName = getFileName(name, version);
  console.log(`* ${name} - store - putting package file ${fileName} in store`);

  statPackage(name)
    .catch(() => createPackageDir(name))
    .then(() => writePackage(name, version, data))
    .then(() => {
      console.log(`* ${name} - store - successfully put package file ${fileName} in store`);
      resolve(data);
    })
    .catch(err => {
      console.log(`* ${name} - store - failed to put package in store: ${err}`);
      reject(err);
    });
});
