import request from 'request';
import { rootRegistry } from './global';

export const fetchMetadata = (name, done) => {
  request(`${rootRegistry}/${name}`, (error, response, body) => {
    if (error) {
      done(error);
    } else if (response.statusCode < 200 || response.statusCode >= 300) {
      done(new Error('statusCode was not 2XX'));
    } else {
      done(null, body);
    }
  });
};
