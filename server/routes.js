const logger = require('winston');
const { createValidation, validatorRepository } = require('./common/api/common_api');

const validate = createValidation(validatorRepository);

const routes = (app, api) => {
  app.get('/npm/-/ping', api.npm.registry.ping);
  app.get('/npm/:repo', validate(api.npm.registry.fetchRegistryInfo));

  app.get('/npm/:repo/:name/:version?', validate(api.npm.packages.fetchPackage));
  app.get('/npm/:repo/:name/-/:distFile', validate(api.npm.packages.fetchDistFile));
  app.get('/npm/:repo/-/all*', validate(api.npm.packages.searchPackage));

  app.get('/npm/*', (req, res) => {
    logger.error(`Unhandled URL: ${req.url}`);
    res.status(404).send({ message: 'Not found' });
  });
};

module.exports = routes;
