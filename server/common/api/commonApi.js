const config = require("config");

const reposConfig = config.get("server.repos");

const getErrorMessage = statusCode => {
  switch (statusCode) {
    case 404:
      return "not found";
    default:
      return "internal error";
  }
};

const handleError = (res, err) => {
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({ message: getErrorMessage(statusCode) });
};

const validatorRepository = (req, res) => {
  const repo = req.params.repo;

  if (reposConfig[repo]) return true;

  const statusCode = 404;
  res.status(statusCode).send({ message: getErrorMessage(statusCode) });
  return false;
};

const createValidation = (...validators) => api => (req, res) =>
  validators.every(validator => validator(req, res)) && api(req, res);

module.exports = {
  handleError,
  validatorRepository,
  createValidation
};
