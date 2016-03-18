import request from 'request';
import config from './config';

// TODO fix error returns

const requestPromise = options => new Promise((resolve, reject) => {
  request(options, (error, response, body) => {
    if (error) {
      reject(error);
    } else if (response.statusCode < 200 || response.statusCode >= 300) {
      reject(new Error('statusCode was not 2XX'));
    } else {
      resolve({ body, response });
    }
  });
});

export const fetchPackage = name => new Promise((resolve, reject) => {
  console.log(`* ${name} - fetching package from upstream`);

  requestPromise(`${config.upstream}/${name}`)
    .then(data => resolve(data.body))
    .catch(err => reject(err));
});
