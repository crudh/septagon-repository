const _get = require("lodash/fp/get");
const _keys = require("lodash/fp/keys");

const isSet = () => (key, config) => (_get(key, config) ? "" : `${key}: should be set`);

const isAny = (...options) => (key, config) =>
  (options.includes(_get(key, config)) ? "" : `${key}: should be any of [${options}]`);

const hasChild = () => (key, config) =>
  (_keys(_get(key, config)).length > 0 ? "" : `${key}: should have at least one child`);

const runChecks = (state, config, checks) =>
  checks.reduce(
    (checksState, [key, ...ops]) => [...checksState, ...ops.map(op => op(key, config)).filter(_ => _)],
    state
  );

const locationValidation = () => [
  ["location", isSet()],
  ["location.protocol", isSet(), isAny("http", "https")],
  ["location.host", isSet()],
  ["location.port", isSet()]
];

const reposValidation = () => [["repos", isSet(), hasChild()]];

const runValidations = (config, ...validations) =>
  validations.reduce((state, validation) => runChecks(state, config, validation()), []);

const validateServerConfig = config => runValidations(config, locationValidation, reposValidation);

module.exports = {
  validateServerConfig
};
