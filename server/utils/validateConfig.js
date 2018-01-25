const _getOr = require("lodash/fp/getOr")
const _has = require("lodash/fp/has")
const _isFinite = require("lodash/fp/isFinite")
const _isPlainObject = require("lodash/fp/isPlainObject")
const _isString = require("lodash/fp/isstring")
const _last = require("lodash/fp/last")

const notSet = value => value === null || value === undefined

const isSet = () => (key, value) =>
  !notSet(value) ? "" : `${key}: should be set`

const isAny = (...options) => (key, value) =>
  notSet(value) || options.includes(value)
    ? ""
    : `${key}: should be any of [${options}]`

const isEqual = otherValue => (key, value) =>
  notSet(value) || value === otherValue
    ? ""
    : `${key}: should match ${otherValue}`

const isObject = () => (key, value) =>
  notSet(value) || _isPlainObject(value) ? "" : `${key}: should be an object`

const isString = () => (key, value) =>
  notSet(value) || _isString(value) ? "" : `${key}: should be a string`

const isNumber = () => (key, value) =>
  notSet(value) || _isFinite(parseInt(value, 10))
    ? ""
    : `${key}: should be a number`

const isBoolean = () => (key, value) =>
  notSet(value) || value === true || value === false
    ? ""
    : `${key}: should be a boolean`

const hasChild = () => (key, value) =>
  notSet(value) || Object.keys(value || {}).length > 0
    ? ""
    : `${key}: should have at least one child`

const hasRequiredPathInConfig = requiredPath => (key, value, config) =>
  notSet(value) || _has(requiredPath, config)
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
    ["location", isSet(), isObject()],
    ["location.protocol", isSet(), isString(), isAny("http", "https")],
    ["location.host", isSet(), isString()],
    ["location.port", isSet(), isNumber()],
    ["repos", isSet(), isObject(), hasChild()],
    ...createChildrenChecks(config, "repos", (key, childKey) => [
      [`${key}.id`, isSet(), isString(), isEqual(childKey)],
      [`${key}.storage`, isSet(), isString()],
      [`${key}.public`, isSet(), isBoolean()],
      ...createChildrenChecks(config, `repos.${childKey}.users`, key => [
        [
          `${key}`,
          isString(),
          isAny("read", "write"),
          hasRequiredPathInConfig(`users.${_last(key.split("."))}`)
        ]
      ])
    ]),
    ["log", isSet(), isObject()],
    ["users", isSet(), isObject()],
    ...createChildrenChecks(config, "users", key => [
      [`${key}.salt`, isSet(), isString()],
      [`${key}.hash`, isSet(), isString()]
    ])
  )

module.exports = {
  validateServerConfig
}
