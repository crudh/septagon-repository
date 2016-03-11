import fs from 'fs';
import https from 'https';

const rootRegistry = 'https://registry.npmjs.org';

export const syncPackage = (name, done) => {
  const req = https.request(`${rootRegistry}/${name}`, res => {
    let data = '';

    res.on('data', chunk => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('* writing file to fs: ', name);
      fs.writeFile(`./tmp/${name}`, data, 'utf8', done(null, data));
    });
  });

  req.on('error', e => {
    console.log(`problem with request: ${e.message}`);
    done(e);
  })

  req.end();
};
