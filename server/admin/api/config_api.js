const config = require('config');
const logger = require('winston');

const reposConfig = config.get('server.repos');

const fetchReposConfig = (req, res) => {
  logger.info('Fetching repos config');

  res.set('Content-Type', 'application/json');
  res.send(reposConfig);
};

module.exports = {
  fetchReposConfig
};
