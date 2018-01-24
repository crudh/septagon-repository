const _getOr = require("lodash/fp/getOr")
const _has = require("lodash/fp/has")
const _isFinite = require("lodash/fp/isFinite")
const _isPlainObject = require("lodash/fp/isPlainObject")
const _isString = require("lodash/fp/isstring")
const _last = require("lodash/fp/last")

const isAny = (...options) => (key, value) =>
  options.includes(value) ? "" : `${key}: should be any of [${options}]`

const isEqual = otherValue => (key, value) =>
  value === otherValue ? "" : `${key}: should match ${otherValue}`

const isObject = () => (key, value) =>
  _isPlainObject(value) ? "" : `${key}: should be an object`

const isString = () => (key, value) =>
  _isString(value) ? "" : `${key}: should be a string`

const isNumber = () => (key, value) =>
  _isFinite(parseInt(value, 10)) ? "" : `${key}: should be a number`

const isBoolean = () => (key, value) =>
  value === true || value === false ? "" : `${key}: should be a boolean`

const hasChild = () => (key, value) =>
  Object.keys(value || {}).length > 0
    ? ""
    : `${key}: should have at least one child`

const hasRequiredPathInConfig = requiredPath => (key, value, config) =>
  _has(requiredPath, config)
    ? ""
    : `${key}: required path is not set at ${requiredPath}`

const runChecks = (config, ...checks) =>
  checks.reduce(
    (checksState, [key, ...checkFuncs]) => [
      ...checksState,
      ...checkFuncs
        .map(checkFunc => checkFunc(key, _getOr(null, key, config), config))
        .filter(_ => _)
    ],
    []
  )

const createChildrenChecks = (config, parentKey, checkFunc) =>
  Object.keys(_getOr({}, parentKey, config))
    .map(childKey => checkFunc(`${parentKey}.${childKey}`, childKey, parentKey))
    .reduce((acc, cur) => acc.concat(cur), [])

const validateServerConfig = config =>
  runChecks(
    config,
    ["location", isObject()],
    ["location.protocol", isString(), isAny("http")],
    ["location.host", isString()],
    ["location.port", isNumber()],
    ["repos", isObject(), hasChild()],
    ...createChildrenChecks(config, "repos", (key, childKey) => [
      [`${key}.id`, isString(), isEqual(childKey)],
      [`${key}.storage`, isString()],
      [`${key}.public`, isBoolean()],
      ...createChildrenChecks(config, `repos.${childKey}.users`, key => [
        [
          `${key}`,
          isString(),
          isAny("read", "write"),
          hasRequiredPathInConfig(`users.${_last(key.split("."))}`)
        ]
      ])
    ]),
    ["log", isObject()],
    ["users", isObject()],
    ...createChildrenChecks(config, "users", key => [
      [`${key}.salt`, isString()],
      [`${key}.hash`, isString()]
    ])
  )

module.exports = {
  validateServerConfig
}
