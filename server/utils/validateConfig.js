const _getOr = require("lodash/fp/getOr");
const _isFinite = require("lodash/fp/isFinite");
const _isPlainObject = require("lodash/fp/isPlainObject");

const isSet = () => (key, value) => (value ? "" : `${key}: should be set`);

const isAny = (...options) => (key, value) =>
  options.includes(value) ? "" : `${key}: should be any of [${options}]`;

const isEqual = otherValue => (key, value) =>
  value === otherValue ? "" : `${key}: should match ${otherValue}`;

const isObject = () => (key, value) =>
  _isPlainObject(value) ? "" : `${key}: should be an object`;

const isNumber = () => (key, value) =>
  _isFinite(parseInt(value, 10)) ? "" : `${key}: should be a number`;

const hasChild = () => (key, value) =>
  Object.keys(value || {}).length > 0
    ? ""
    : `${key}: should have at least one child`;

const runChecks = (config, ...checks) =>
  checks.reduce(
    (checksState, [key, ...checkFuncs]) => [
      ...checksState,
      ...checkFuncs
        .map(checkFunc => checkFunc(key, _getOr(null, key, config), config))
        .filter(_ => _)
    ],
    []
  );

const createChildrenChecks = (config, parentKey, checkFunc) =>
  Object.keys(_getOr({}, parentKey, config))
    .map(childKey => checkFunc(`${parentKey}.${childKey}`, childKey, parentKey))
    .reduce((acc, cur) => acc.concat(cur), []);

const validateServerConfig = config =>
  runChecks(
    config,
    ["location", isSet(), isObject()],
    ["location.protocol", isSet(), isAny("http")],
    ["location.host", isSet()],
    ["location.port", isSet(), isNumber()],
    ["repos", isSet(), isObject(), hasChild()],
    ...createChildrenChecks(config, "repos", (key, childKey) => [
      [`${key}.id`, isSet(), isEqual(childKey)],
      [`${key}.storage`, isSet()]
    ])
  );

module.exports = {
  validateServerConfig
};
