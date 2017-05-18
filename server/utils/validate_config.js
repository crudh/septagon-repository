const _flatten = require("lodash/fp/flatten");
const _flow = require("lodash/fp/flow");
const _get = require("lodash/fp/get");
const _getOr = require("lodash/fp/getOr");
const _isPlainObject = require("lodash/fp/isPlainObject");
const _keys = require("lodash/fp/keys");
const _map = require("lodash/fp/map");

const isSet = () => (key, config) => (_get(key, config) ? "" : `${key}: should be set`);

const isAny = (...options) => (key, config) =>
  (options.includes(_get(key, config)) ? "" : `${key}: should be any of [${options}]`);

const isEqual = value => (key, config) => (_get(key, config) === value ? "" : `${key}: should match ${value}`);

const isObject = () => (key, config) => (_isPlainObject(_get(key, config)) ? "" : `${key}: should be an object`);

const hasChild = () => (key, config) =>
  (_keys(_get(key, config)).length > 0 ? "" : `${key}: should have at least one child`);

const runChecks = (config, ...checks) =>
  checks.reduce((checksState, [key, ...ops]) => [...checksState, ...ops.map(op => op(key, config)).filter(_ => _)], []);

const createChildrenChecks = (config, parentKey, checkFunc) =>
  _flow(
    _getOr({}, parentKey),
    _keys,
    _map(childKey => checkFunc(`${parentKey}.${childKey}`, childKey, parentKey)),
    _flatten
  )(config);

const validateServerConfig = config =>
  runChecks(
    config,
    ["location", isSet()],
    ["location.protocol", isSet(), isAny("http", "https")],
    ["location.host", isSet()],
    ["location.port", isSet()],
    ["repos", isSet(), isObject(), hasChild()],
    ...createChildrenChecks(config, "repos", (key, childKey) => [
      [`${key}.id`, isSet(), isEqual(childKey)],
      [`${key}.storage`, isSet()]
    ])
  );

module.exports = {
  validateServerConfig
};
