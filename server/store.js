import fs from 'fs';
import config from './config';

// TODO fix error returns

const statPackage = name => new Promise((resolve, reject) => {
  console.log(`* ${name} - store - checking if package dir exists`);
  fs.stat(`${config.storage}/${name}`, err => err ? reject(err) : resolve());
});

const readPackage = name => new Promise((resolve, reject) => {
  console.log(`* ${name} - store - reading package`);
  fs.readFile(`${config.storage}/${name}/all`, 'utf8', (err, data) => err ? reject(err) : resolve(data));
});

const writePackage = (name, data) => new Promise((resolve, reject) => {
  console.log(`* ${name} - store - writing package`);
  fs.writeFile(`${config.storage}/${name}/all`, data, 'utf8', err => err ? reject(err) : resolve());
});

const createPackageDir = name => new Promise((resolve, reject) => {
  console.log(`* ${name} - store - creating package dir`);
  fs.mkdir(`${config.storage}/${name}`, err => err ? reject(err) : resolve());
});

export const getPackage = name => new Promise((resolve, reject) => {
  console.log(`* ${name} - store - getting package from store`);

  statPackage(name)
    .then(() => readPackage(name))
    .then(data => {
      console.log(`* ${name} - store - successfully got package from store`);
      resolve(data);
    })
    .catch(err => {
      console.log(`* ${name} - store - failed to get package from store: ${err}`);
      reject(err);
    });
});

export const putPackage = (name, data) => new Promise((resolve, reject) => {
  console.log(`* ${name} - store - putting package in store`);

  statPackage(name)
    .catch(() => createPackageDir(name))
    .then(() => writePackage(name, data))
    .then(() => {
      console.log(`* ${name} - store - successfully put package in store`);
      resolve(data);
    })
    .catch(err => {
      console.log(`* ${name} - store - failed to put package in store: ${err}`);
      reject(err);
    });
});
