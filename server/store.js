import fs from 'fs';

const storage = './tmp';

export const getMetadata = (name, done) => {
  console.log(`* ${name} - reading metadata from store`);
  fs.readFile(`${storage}/${name}`, 'utf8', done);
};

export const saveMetadata = (name, data) => {
  fs.writeFile(`${storage}/${name}`, data, 'utf8', err => {
    if (err) {
      console.log(`* ${name} - failed to write metadata to store`);
      return;
    }

    console.log(`* ${name} - wrote metadata to store`);
  });
};
