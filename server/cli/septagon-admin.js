#!/usr/bin/env node
/* eslint "no-console": "off" */
const program = require("commander")
const { fs } = require("../utils/promisified")
const { hashPassword, generateSalt } = require("../utils/password")

const createError = (message, source) => ({ message, source })

const printError = error => {
  console.warn("Error!")
  !error.message && !error.source && console.warn(`Error: ${error}`)

  error.message && console.warn(error.message)
  error.source && console.warn(error.source)
}

const checkFileExists = filePath =>
  new Promise((resolve, reject) =>
    fs
      .stat(filePath)
      .then(() => resolve(filePath))
      .catch(e => reject(createError(`File not found: '${filePath}'`, e)))
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

const commandCompleted = () =>
  console.info("Success! Remember to restart the server")

const createUser = (configfile, username, password) => {
  checkFileExists(configfile)
    .then(readFile)
    .then(convertToJson)
    .then(config =>
      generateSalt().then(salt =>
        hashPassword(password, salt).then(hash =>
          convertToText({
            ...config,
            server: {
              ...config.server,
              users: {
                ...config.server.users,
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
    )
    .catch(printError)
}

program
  .command("createuser <configfile> <username> <password>")
  .description("Create a user and set password")
  .action(createUser)

program.parse(process.argv)
console.log("")
