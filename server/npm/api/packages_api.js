const config = require('config');
const request = require('request');
const logger = require('winston');
const { handleError } = require('../../common/api/common_api');
const { getDistFile } = require('../handlers/distfile');
const { getPackage } = require('../handlers/package');

const reposConfig = config.get('server.repos');

const fetchDistFile = (req, res) => {
  const repo = req.params.repo;
  const name = req.params.name;
  const distFile = req.params.distFile;
  logger.info(`Fetching distfile for package ${name} (${req.originalUrl})`);

  getDistFile(reposConfig[repo], name, distFile, (err, stream) => {
    if (err) {
      logger.error(`Error when fetching distfile ${distFile} for package ${name}`, err);
      return handleError(res, err);
    }

    res.set('Content-Type', 'application/octet-stream');
    return stream.pipe(res);
  });
};

const fetchPackage = (req, res) => {
  const repo = req.params.repo;
  const name = req.params.name;
  const version = req.params.version;
  logger.info(`Fetching package ${name}@${version || ''} (${req.originalUrl})`);

  getPackage(reposConfig[repo], name, version, (err, stream) => {
    if (err) {
      logger.error(`Error when fetching package ${name}@${version || ''}`, err);
      return handleError(res, err);
    }

    res.set('Content-Type', 'application/json');
    return stream.pipe(res);
  });
};

const searchPackage = (req, res) => {
  const repo = req.params.repo;

  req.pipe(request(reposConfig[repo].upstream + req.url)).pipe(res);
};

module.exports = {
  fetchDistFile,
  fetchPackage,
  searchPackage
};
