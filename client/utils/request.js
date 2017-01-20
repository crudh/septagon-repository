/* global fetch */
const handleError = error => {
  console.error('An error occurred during request', error);
  throw error;
};

const handleResponseError = response => {
  const error = new Error(response.statusText);
  error.response = response;
  error.status = response.status;
  error.statusText = response.statusText;

  handleError(error);
};

const handleResponse = response => {
  if (!response.ok) return handleResponseError(response);

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return { response };
  }

  return response.json().then(
    json => ({ response, json }),
    handleError
  );
};

const request = (url, options) => (
    fetch(url, options).then(
      handleResponse,
      handleError
    )
);

export default request;
