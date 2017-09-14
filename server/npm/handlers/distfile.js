const fs = require("fs");
const mkdirp = require("mkdirp");
const request = require("request");
const logger = require("winston");

const streamDistFile = (repo, name, distFile) =>
  fs.createReadStream(`${repo.storage}/${name}/-/${distFile}`);

const checkDistFile = (repo, name, distFile, callback) =>
  fs.stat(`${repo.storage}/${name}/-/${distFile}`, err => callback(err));

const getDistFile = (repo, name, distFile) =>
  new Promise((resolve, reject) => {
    const directoryPath = `${repo.storage}/${name}/-`;
    const filePath = `${directoryPath}/${distFile}`;

    return checkDistFile(repo, name, distFile, errFile => {
      if (!errFile) return resolve(streamDistFile(repo, name, distFile));
      if (!repo.upstream) return reject({ statusCode: 404 });

      const req = request(`${repo.upstream}/${name}/-/${distFile}`);
      req.pause();

      return req
        .on("error", errRequest => {
          logger.error(
            `Network error when fetching distfile ${distFile} for package ${name} from upstream`
          );
          reject(errRequest);
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

          return mkdirp(directoryPath, errDir => {
            if (errDir) return reject(errDir);

            req.pipe(
              fs
                .createWriteStream(filePath)
                .on("error", errWrite => {
                  logger.error(
                    `Error when writing distfile ${distFile} for package ${name} to storage`
                  );
                  reject(errWrite);
                })
                .on("finish", () =>
                  resolve(streamDistFile(repo, name, distFile))
                )
            );

            return req.resume();
          });
        });
    });
  });

module.exports = {
  getDistFile
};
