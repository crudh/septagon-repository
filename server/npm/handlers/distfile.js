const { promisify } = require("util");
const fs = require("fs");
const request = require("request");
const logger = require("winston");

const mkdirp = promisify(require("mkdirp"));
const stat = promisify(fs.stat);

const streamDistFile = (repo, name, distFile) =>
  fs.createReadStream(`${repo.storage}/${name}/-/${distFile}`);

const checkDistFile = (repo, name, distFile) =>
  stat(`${repo.storage}/${name}/-/${distFile}`);

const getDistFile = (repo, name, distFile) =>
  new Promise((resolve, reject) => {
    const directoryPath = `${repo.storage}/${name}/-`;
    const filePath = `${directoryPath}/${distFile}`;

    return checkDistFile(repo, name, distFile)
      .then(() => resolve(streamDistFile(repo, name, distFile)))
      .catch(() => {
        if (!repo.upstream) return reject({ statusCode: 404 });

        const req = request(`${repo.upstream}/${name}/-/${distFile}`);
        req.pause();

        return req
          .on("error", error => {
            logger.error(
              `Network error when fetching distfile ${distFile} for package ${name} from upstream`
            );
            reject(error);
          })
          .on("response", response => {
            const statusCode = response.statusCode;

            if (statusCode < 200 || statusCode >= 300) {
              const error = new Error(
                `Got ${statusCode} when fetching dist file from upstream`
              );
              error.statusCode = statusCode;
              return reject(error);
            }

            return mkdirp(directoryPath)
              .then(() => {
                req.pipe(
                  fs
                    .createWriteStream(filePath)
                    .on("error", error => {
                      logger.error(
                        `Error when writing distfile ${distFile} for package ${name} to storage`
                      );
                      reject(error);
                    })
                    .on("finish", () =>
                      resolve(streamDistFile(repo, name, distFile))
                    )
                );

                return req.resume();
              })
              .catch(error => reject(error));
          });
      });
  });

module.exports = {
  getDistFile
};
