export const getErrorMessage = (statusCode) => {
  switch (statusCode) {
    case 404:
      return 'not found';
    default:
      return 'internal error';
  }
};
