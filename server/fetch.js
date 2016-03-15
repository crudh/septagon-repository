import request from 'request';
import config from './config';

export const fetchPackage = (name, done) => {
  console.log(`* ${name} - fetching package from upstream`);
  request(`${config.upstream}/${name}`, (error, response, body) => {
    if (error) {
      console.log(`* ${name} - failed to fetch package from upsteam`);
      done(error);
    } else if (response.statusCode < 200 || response.statusCode >= 300) {
      console.log(`* ${name} - failed to fetch package from upsteam`);
      done(new Error('statusCode was not 2XX'));
    } else {
      console.log(`* ${name} - fetched package from upsteam`);
      done(null, body);
    }
  });
};
