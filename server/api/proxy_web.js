import request from 'request';
import config from '../config';

export const init = app => {
  // npm search
  app.get('/registry/main/-/all*', (req, res) => {
    req.pipe(request(config.upstream + req.url)).pipe(res);
  });
};
