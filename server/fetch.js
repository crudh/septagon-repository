import https from 'https';

const rootRegistry = 'https://registry.npmjs.org';

export const fetchMetadata = (name, done) => {
  const req = https.request(`${rootRegistry}/${name}`, res => {
    let data = '';

    res.on('data', chunk => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`* ${name} - success fetching metadata`);
      done(null, data);
    });
  });

  req.on('error', e => {
    console.log(`* ${name} - error fetching metadata`);
    done(e);
  });

  req.end();
};
