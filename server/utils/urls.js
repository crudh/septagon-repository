const getServerUrl = location => (
  `${location.protocol}://${location.host}:${location.port}`
);

module.exports = {
  getServerUrl
};
