const config = require("config")

const reposConfig = config.get("server.repos")

const getErrorMessage = statusCode => {
  switch (statusCode) {
    case 401:
      return "not authorized"
    case 404:
      return "not found"
    default:
      return "internal error"
  }
}

const handleError = (res, err) => {
  const statusCode = err.statusCode || 500
  return res.status(statusCode).json({ message: getErrorMessage(statusCode) })
}

const validatorRepoExists = req =>
  new Promise(
    (resolve, reject) =>
      reposConfig[req.params.repo] ? resolve(200) : reject(404)
  )

const createValidation = (...validators) => api => (req, res) =>
  new Promise(resolve =>
    validators
      .reduce(
        (validatorChain, currentValidator) =>
          validatorChain.then(() => currentValidator(req, res).then(_ => _)),
        Promise.resolve()
      )
      .then(() => resolve(api(req, res)))
      .catch(errorCode =>
        resolve(
          res.status(errorCode).send({ message: getErrorMessage(errorCode) })
        )
      )
  )

module.exports = {
  handleError,
  validatorRepoExists,
  createValidation
}
