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

module.exports = {
  getErrorMessage,
  handleError
}
