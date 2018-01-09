const { createReadStream, createWriteStream } = require("fs")
const request = require("request")
const logger = require("winston")
const { mkdirp, fs } = require("../../utils/promisified")

const checkLocal = (repo, name) => fs.stat(`${repo.storage}/local/${name}`)

const getDistFile = (repo, name, distFile) =>
  new Promise((resolve, reject) => {
    return checkLocal(repo, name)
      .then(() => {
        const directoryPath = `${repo.storage}/local/${name}/-`
        const filePath = `${directoryPath}/${distFile}`

        return fs
          .stat(filePath)
          .then(() => resolve(createReadStream(repo, name, distFile)))
          .catch(() => reject({ statusCode: 404 }))
      })
      .catch(() => {
        if (!repo.upstream) return reject({ statusCode: 404 })

        const directoryPath = `${repo.storage}/upstream/${name}/-`
        const filePath = `${directoryPath}/${distFile}`

        return fs
          .stat(filePath)
          .then(() => resolve(createReadStream(filePath)))
          .catch(() => {
            const req = request(`${repo.upstream}/${name}/-/${distFile}`)
            req.pause()

            return req
              .on("error", error => {
                logger.error(
                  `Network error when fetching distfile ${distFile} for package ${name} from upstream`
                )
                reject(error)
              })
              .on("response", response => {
                const statusCode = response.statusCode

                if (statusCode < 200 || statusCode >= 300) {
                  const error = new Error(
                    `Got ${statusCode} when fetching dist file from upstream`
                  )
                  error.statusCode = statusCode
                  return reject(error)
                }

                return mkdirp(directoryPath)
                  .then(() => {
                    req.pipe(
                      createWriteStream(filePath)
                        .on("error", error => {
                          logger.error(
                            `Error when writing distfile ${distFile} for package ${name} to storage`
                          )
                          reject(error)
                        })
                        .on("finish", () => resolve(createReadStream(filePath)))
                    )

                    return req.resume()
                  })
                  .catch(error => reject(error))
              })
          })
      })
  })

module.exports = {
  getDistFile
}
