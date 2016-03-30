const getMessage = statusCode => {
  switch (statusCode) {
    case 404:
      return 'not found';
    default:
      return 'internal error';
  }
};

export const handleError = (res, err) => {
  const statusCode = err.statusCode || 500;
  res.set('Content-Type', 'application/json');
  return res.status(statusCode).send({ message: getMessage(statusCode) });
};
