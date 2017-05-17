const _get = require("lodash/fp/get");

const isSet = () => (key, config) => (_get(key, config) ? "" : `${key}: should be set`);

const isAny = (...options) => (key, config) =>
  (options.includes(_get(key, config)) ? "" : `${key}: should be any of [${options}]`);

const runChecks = (state, config, ...checks) =>
  checks.reduce(
    (checksState, [key, ...ops]) => [...checksState, ...ops.map(op => op(key, config)).filter(_ => _)],
    state
  );

const validateLocation = (state, config) =>
  runChecks(
    state,
    config,
    ["location", isSet()],
    ["location.protocol", isSet(), isAny("http", "https")],
    ["location.host", isSet()],
    ["location.port", isSet()]
  );

const validateRepos = (state, config) => runChecks(state, config, ["repos", isSet()]);

const validateServerConfig = config =>
  [validateLocation, validateRepos].reduce((state, validationFunc) => validationFunc(state, config), []);

module.exports = {
  validateServerConfig
};
