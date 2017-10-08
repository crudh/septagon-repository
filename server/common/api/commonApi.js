const config = require("config");

const serverConfig = config.get("server");

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
  res.set("Content-Type", "application/json");
  return res.status(statusCode).send({ message: getErrorMessage(statusCode) });
};

const validatorRepository = (req, res) => {
  const repo = req.params.repo;

  if (serverConfig.repos[repo]) return true;

  const statusCode = 404;
  res.status(statusCode).send({ message: getErrorMessage(statusCode) });
  return false;
};

const createValidation = (...validators) => api => (req, res) => {
  const allPassed = validators.every(validator => validator(req, res));
  if (allPassed) {
    api(req, res);
  }
};

module.exports = {
  handleError,
  validatorRepository,
  createValidation
};
