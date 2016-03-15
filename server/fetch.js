import request from 'request';
import config from './config';

export const fetchMetadata = (name, done) => {
  request(`${config.upstream}/${name}`, (error, response, body) => {
    if (error) {
      done(error);
    } else if (response.statusCode < 200 || response.statusCode >= 300) {
      done(new Error('statusCode was not 2XX'));
    } else {
      done(null, body);
    }
  });
};
