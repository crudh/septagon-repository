import request from 'request';
import config from './config';

const init = app => {
  app.get('/-/all*', (req, res) => {
    req.pipe(request(config.upstream + req.url)).pipe(res);
  });
};

export default {
  init
};
