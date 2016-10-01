import config from 'config';
import request from 'request';
import logger from 'winston';
import { getDistFile } from '../distfile';
import { getPackage } from '../package';

const serverConfig = config.get('server');

const getMessage = statusCode => {
  switch (statusCode) {
    case 404:
      return 'not found';
    default:
      return 'internal error';
  }
};

const handleError = (res, err) => {
  const statusCode = err.statusCode || 500;
  res.set('Content-Type', 'application/json');
  return res.status(statusCode).send({ message: getMessage(statusCode) });
};

export const fetchDistFile = (req, res) => {
  const name = req.params.name;
  const distFile = req.params.distFile;
  logger.info(`Fetching distfile for package ${name} (${req.originalUrl})`);

  getDistFile(name, distFile, (err, stream) => {
    if (err) {
      logger.error(`Error when fetching distfile ${distFile} for package ${name}`, err);
      return handleError(res, err);
    }

    res.set('Content-Type', 'application/octet-stream');
    return stream.pipe(res);
  });
};

export const fetchPackage = (req, res) => {
  const name = req.params.name;
  const version = req.params.version;
  logger.info(`Fetching package ${name}@${version || ''} (${req.originalUrl})`);

  getPackage(name, version, (err, stream) => {
    if (err) {
      logger.error(`Error when fetching package ${name}@${version || ''}`, err);
      return handleError(res, err);
    }

    res.set('Content-Type', 'application/json');
    return stream.pipe(res);
  });
};

export const searchPackage = (req, res) => {
  req.pipe(request(serverConfig.upstream + req.url)).pipe(res);
};
