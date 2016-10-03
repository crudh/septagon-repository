import config from 'config';
import request from 'request';
import logger from 'winston';
import { handleError } from './common_api';
import { getDistFile } from '../handlers/distfile';
import { getPackage } from '../handlers/package';

const reposConfig = config.get('server.repos');

export const fetchDistFile = (req, res) => {
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

export const fetchPackage = (req, res) => {
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

export const searchPackage = (req, res) => {
  const repo = req.params.repo;

  req.pipe(request(reposConfig[repo].upstream + req.url)).pipe(res);
};
