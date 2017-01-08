const { createValidation, validatorRepository } = require('./api/common_api');

const validate = createValidation(validatorRepository);

const routes = (app, api) => {
  app.get('/npm/-/ping', api.registry.ping);
  app.get('/npm/:repo', validate(api.registry.fetchRegistryInfo));

  app.get('/npm/:repo/:name/:version?', validate(api.package.fetchPackage));
  app.get('/npm/:repo/:name/-/:distFile', validate(api.package.fetchDistFile));
  app.get('/npm/:repo/-/all*', validate(api.package.searchPackage));
};

module.exports = routes;
