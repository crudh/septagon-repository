import request from 'request';
import { rootRegistry } from './global';

const init = app => {
  app.get('/-/all*', (req, res) => {
    req.pipe(request(rootRegistry + req.url)).pipe(res);
  });
};

export default {
  init
};
