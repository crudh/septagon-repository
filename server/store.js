import fs from 'fs';

const storage = './tmp';

export const getPackage = (name, done) => {
  console.log(`* ${name} - reading package from store`);
  fs.readFile(`${storage}/${name}`, 'utf8', done);
};

export const putPackage = (name, data) => {
  fs.writeFile(`${storage}/${name}`, data, 'utf8', err => {
    if (err) {
      console.log(`* ${name} - failed to write package to store`);
      return;
    }

    console.log(`* ${name} - wrote package to store`);
  });
};
