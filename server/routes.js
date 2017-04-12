const logger = require('winston');
const { createValidation, validatorRepository } = require('./common/api/common_api');
const npmPackagesAPI = require('./npm/api/packages_api');
const npmRegistryAPI = require('./npm/api/registry_api');

const validate = createValidation(validatorRepository);

const unhandledUrl = (req, res) => {
  logger.error(`Unhandled URL: ${req.url}`);
  res.status(404).send({ message: 'Not found' });
};

const routes = app => {
  app.get('/npm/-/ping', npmRegistryAPI.ping);
  app.get('/npm/:repo', validate(npmRegistryAPI.fetchRegistryInfo));
  app.get('/npm/:repo/-/all*', validate(npmPackagesAPI.searchPackage));
  app.get('/npm/:repo/:name/:version?', validate(npmPackagesAPI.fetchPackage));
  app.get('/npm/:repo/:name/-/:distFile', validate(npmPackagesAPI.fetchDistFile));
  app.get('/npm/*', unhandledUrl);
};

module.exports = routes;
