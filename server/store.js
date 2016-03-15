import fs from 'fs';
import config from './config';

export const getPackage = (name, done) => {
  console.log(`* ${name} - reading package from store`);

  fs.stat(`${config.storage}/${name}`, err => {
    if (err) {
      console.log(`* ${name} - no package in store`);
      done(err);
    } else {
      fs.readFile(`${config.storage}/${name}/all`, 'utf8', done);
    }
  });
};

export const putPackage = (name, data) => {
  const writeFileCallback = err => {
    if (err) {
      console.log(`* ${name} - failed to write package to store`);
    } else {
      console.log(`* ${name} - wrote package to store`);
    }
  };

  const mkdirCallback = err => {
    if (err) {
      console.log(`* ${name} - failed to create package dir in store`);
    } else {
      fs.writeFile(`${config.storage}/${name}/all`, data, 'utf8', writeFileCallback);
    }
  };

  fs.stat(`${config.storage}/${name}`, err => {
    if (err) {
      fs.mkdir(`${config.storage}/${name}`, mkdirCallback);
    } else {
      mkdirCallback();
    }
  });
};
