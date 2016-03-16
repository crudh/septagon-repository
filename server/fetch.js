import request from 'request';
import config from './config';

// TODO fix error returns

export const fetchPackage = name => new Promise((resolve, reject) => {
  console.log(`* ${name} - fetching package from upstream`);

  request(`${config.upstream}/${name}`, (error, response, body) => {
    if (error) {
      console.log(`* ${name} - fetch - failed to fetch package from upsteam`);
      reject(error);
    } else if (response.statusCode < 200 || response.statusCode >= 300) {
      console.log(`* ${name} - fetch - failed to fetch package from upsteam`);
      reject(new Error('statusCode was not 2XX'));
    } else {
      console.log(`* ${name} - fetch - successfully fetched package from upsteam`);
      resolve(body);
    }
  });
});
