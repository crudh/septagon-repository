import { getPackageHandler } from './package';

export const init = app => {
  app.get('/registry/main/:name', (req, res) => {
    const name = req.params.name;
    console.log(`----- ${name} - ${req.originalUrl}`);

    res.set('Content-Type', 'application/json');
    getPackageHandler(req, res, name);
  });

  app.get('/registry/main/:name/:version', (req, res) => {
    const name = req.params.name;
    const version = req.params.version;
    console.log(`----- ${name}@${version} - ${req.originalUrl}`);

    res.set('Content-Type', 'application/json');
    getPackageHandler(req, res, name, version);
  });
};
