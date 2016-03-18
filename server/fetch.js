import request from 'request';
import config from './config';

// TODO fix error returns

const requestPromise = options => new Promise((resolve, reject) => {
  request(options, (err, response, body) => {
    if (err) {
      reject(err);
    } else if (response.statusCode < 200 || response.statusCode >= 300) {
      const error = new Error('statusCode was not 2XX');
      error.statusCode = response.statusCode;
      reject(error);
    } else {
      resolve({ body, response });
    }
  });
});

export const fetchPackage = name => new Promise((resolve, reject) => {
  console.log(`* ${name} - fetch - fetching package from upstream`);

  requestPromise(`${config.upstream}/${name}`)
    .then(data => resolve(data.body))
    .catch(err => reject(err));
});
