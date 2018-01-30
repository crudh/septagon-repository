#!/usr/bin/env node
/* eslint "no-console": "off" */
const program = require("commander")
const { fs } = require("../utils/promisified")
const { hashPassword, generateSalt } = require("../utils/password")

const createError = (message, source) => {
  const error = new Error(message)
  error.source = source

  return error
}

const checkFileExists = filePath =>
  new Promise((resolve, reject) =>
    fs
      .stat(filePath)
      .then(() => resolve(filePath))
      .catch(e => reject(createError(`File not found: '${filePath}'`, e)))
  )

const checkConfig = config =>
  new Promise(
    (resolve, reject) =>
      config && config.server && config.server.repos
        ? resolve(config)
        : reject(createError("Not a valid config file"))
  )

const checkConfigRepo = (config, repo) =>
  new Promise(
    (resolve, reject) =>
      config.server.repos && config.server.repos[repo]
        ? resolve(config)
        : reject(createError("Repo not found"))
  )

const checkConfigUser = (config, username) =>
  new Promise(
    (resolve, reject) =>
      (config.server.users || {})[username]
        ? resolve(config)
        : reject(createError("Username doesn't exist"))
  )

const checkConfigUserInRepo = (config, repo, username) =>
  new Promise(
    (resolve, reject) =>
      (config.server.repos[repo].users || {})[username]
        ? resolve(config)
        : reject(createError("User is not added to the specified repo"))
  )

const checkAccessLevel = accessLevel =>
  new Promise(
    (resolve, reject) =>
      ["read", "write"].includes(accessLevel)
        ? resolve()
        : reject(createError("Unknown accesslevel"))
  )

const readFile = filePath =>
  new Promise((resolve, reject) =>
    fs
      .readFile(filePath)
      .then(resolve)
      .catch(e => reject(createError(`Can't read file: '${filePath}'`, e)))
  )

const writeFile = (filePath, text) =>
  new Promise((resolve, reject) =>
    fs
      .writeFile(filePath, text)
      .then(resolve)
      .catch(e => reject(createError(`Can't write file: '${filePath}'`, e)))
  )

const convertToJson = text => new Promise(resolve => resolve(JSON.parse(text)))

const convertToText = data =>
  new Promise(resolve => resolve(JSON.stringify(data, null, 2)))

const commandFailed = error => {
  !error.message && !error.source && console.error(`Error: ${error}`)

  error.message && console.error(`Error: ${error.message}`)
  error.source && console.error(`Source: ${error.source}`)
}

const commandCompleted = () =>
  console.info(
    "Success! Remember to restart the server to activate the changes"
  )

const listUsersAll = config =>
  new Promise(resolve => {
    Object.keys(config.server.users || {}).forEach(username =>
      console.info(username)
    )

    resolve()
  })

const listUsersRepo = (config, repo) =>
  new Promise(resolve => {
    Object.entries(config.server.repos[repo].users || {}).forEach(
      ([username, accesslevel]) => console.info(`${username} (${accesslevel})`)
    )

    resolve()
  })

const listUsers = (configfile, repo) =>
  checkFileExists(configfile)
    .then(readFile)
    .then(convertToJson)
    .then(checkConfig)
    .then(
      config =>
        repo
          ? checkConfigRepo(config, repo).then(() =>
              listUsersRepo(config, repo)
            )
          : listUsersAll(config)
    )
    .catch(commandFailed)

const createUser = (configfile, username, password) =>
  checkFileExists(configfile)
    .then(readFile)
    .then(convertToJson)
    .then(checkConfig)
    .then(config => {
      // FIXME should be a check function
      if ((config.server.users || {})[username])
        throw createError("Username already exists")

      generateSalt().then(salt =>
        hashPassword(password, salt).then(hash =>
          convertToText({
            ...config,
            server: {
              ...config.server,
              users: {
                ...(config.server.users || {}),
                [username]: {
                  hash,
                  salt
                }
              }
            }
          })
            .then(configContent => writeFile(configfile, configContent))
            .then(commandCompleted)
        )
      )
    })
    .catch(commandFailed)

/* eslint "no-unused-vars": "off" */
const deleteUser = (configfile, username) =>
  checkFileExists(configfile)
    .then(readFile)
    .then(convertToJson)
    .then(checkConfig)
    .then(config => checkConfigUser(config, username))
    // FIXME check that the user isn't added to any repo! then fail!
    .then(config => {
      const { [username]: userToRemove, ...remainingUsers } =
        config.server.users || {}

      convertToText({
        ...config,
        server: {
          ...config.server,
          users: remainingUsers
        }
      })
        .then(configContent => writeFile(configfile, configContent))
        .then(commandCompleted)
    })
    .catch(commandFailed)

const addUser = (configfile, repo, username, accesslevel) =>
  checkAccessLevel(accesslevel)
    .then(() => checkFileExists(configfile))
    .then(readFile)
    .then(convertToJson)
    .then(checkConfig)
    .then(config => checkConfigUser(config, username))
    .then(config => checkConfigRepo(config, repo))
    .then(config =>
      convertToText({
        ...config,
        server: {
          ...config.server,
          repos: {
            ...config.server.repos,
            [repo]: {
              ...config.server.repos[repo],
              users: {
                ...(config.server.repos[repo].users || {}),
                [username]: accesslevel
              }
            }
          }
        }
      })
        .then(configContent => writeFile(configfile, configContent))
        .then(commandCompleted)
    )
    .catch(commandFailed)

const removeUser = (configfile, repo, username) =>
  checkFileExists(configfile)
    .then(readFile)
    .then(convertToJson)
    .then(checkConfig)
    .then(config => checkConfigUser(config, username))
    .then(config => checkConfigRepo(config, repo))
    .then(config => checkConfigUserInRepo(config, repo, username))
    .then(config => {
      const { [username]: userToRemove, ...remainingUsers } =
        config.server.repos[repo].users || {}

      convertToText({
        ...config,
        server: {
          ...config.server,
          repos: {
            ...config.server.repos,
            [repo]: {
              ...config.server.repos[repo],
              users: remainingUsers
            }
          }
        }
      })
        .then(configContent => writeFile(configfile, configContent))
        .then(commandCompleted)
    })
    .catch(commandFailed)

program
  .command("listusers <configfile> [repo]")
  .description("List all users or, if repo is specified, the users of the repo")
  .action(listUsers)

program
  .command("createuser <configfile> <username> <password>")
  .description("Create a user and set password")
  .action(createUser)

program
  .command("deleteuser <configfile> <username>")
  .description("Delete a user")
  .action(deleteUser)

program
  .command("changepassword <configfile> <username> <password>")
  .description("Change password for a user")
  .action(() => {})

program
  .command("adduser <configfile> <repo> <username> <accesslevel>")
  .description("Add an existing user to a repo")
  .action(addUser)

program
  .command("removeuser <configfile> <repo> <username>")
  .description("Remove a user from a repo")
  .action(removeUser)

program.parse(process.argv)
