const config = require("config");
const es = require("event-stream");
const { createReadStream, createWriteStream } = require("fs");
const request = require("request");
const { Transform } = require("stream");
const logger = require("winston");
const { mkdirp, stat } = require("../../utils/promisified");
const { getServerUrl } = require("../../utils/urls");

const serverLocation = config.get("server.location");

class TarballReplacer extends Transform {
  constructor(repo) {
    super({ objectMode: true });

    const upstreamHost = repo.upstream.replace(/https?:\/\//, "");
    this.upstreamRegExp = new RegExp(`https?://${upstreamHost}`, "g");
    this.repoId = repo.id;
  }

  _transform(line, encoding, done) {
    this.push(
      line.replace(
        this.upstreamRegExp,
        `${getServerUrl(serverLocation)}/npm/${this.repoId}`
      )
    );

    done();
  }
}

const getFileName = (name, version) => (version ? `${name}-${version}` : name);

const getUpstreamUrl = (repo, name, version) => {
  const baseUrl = `${repo.upstream}/${name}`;
  if (!version) return baseUrl;

  return `${baseUrl}/${version}`;
};

const streamPackage = (repo, path) =>
  createReadStream(path)
    .pipe(es.split())
    .pipe(new TarballReplacer(repo));

const checkLocal = (repo, name) => stat(`${repo.storage}/local/${name}`);

const getMainPackage = (repo, name) =>
  new Promise((resolve, reject) => {
    const fileName = getFileName(name);
    return checkLocal(repo, name)
      .then(() => {
        const directoryPath = `${repo.storage}/local/${name}`;
        const filePath = `${directoryPath}/${fileName}`;

        return stat(filePath)
          .then(() => resolve(streamPackage(repo, filePath)))
          .catch(() => reject({ statusCode: 404 }));
      })
      .catch(() => {
        if (!repo.upstream) return reject({ statusCode: 404 });

        const directoryPath = `${repo.storage}/upstream/${name}`;
        const filePath = `${directoryPath}/${fileName}`;

        const req = request(getUpstreamUrl(repo, name));
        req.pause();

        return req
          .on("error", error => {
            logger.error(
              `Network error when fetching package ${name} from upstream, checking local cache`
            );

            return stat(filePath)
              .then(() => resolve(streamPackage(repo, filePath)))
              .catch(() => reject(error));
          })
          .on("response", response => {
            const statusCode = response.statusCode;

            if (statusCode < 200 || statusCode >= 300) {
              const error = new Error(
                `Got ${statusCode} when fetching package from upstream`
              );
              error.statusCode = statusCode;
              return reject(error);
            }

            return mkdirp(directoryPath)
              .then(() => {
                req.pipe(
                  createWriteStream(filePath)
                    .on("error", error => {
                      logger.error(
                        `Error when writing package ${name} to storage`
                      );
                      reject(error);
                    })
                    .on("finish", () => resolve(streamPackage(repo, filePath)))
                );

                return req.resume();
              })
              .catch(error => reject(error));
          });
      });
  });

const getVersionedPackage = (repo, name, version) =>
  new Promise((resolve, reject) => {
    const fileName = getFileName(name, version);
    return checkLocal(repo, name)
      .then(() => {
        const directoryPath = `${repo.storage}/local/${name}`;
        const filePath = `${directoryPath}/${fileName}`;

        return stat(filePath)
          .then(() => resolve(streamPackage(repo, filePath)))
          .catch(() => reject({ statusCode: 404 }));
      })
      .catch(() => {
        if (!repo.upstream) return reject({ statusCode: 404 });

        const directoryPath = `${repo.storage}/upstream/${name}`;
        const filePath = `${directoryPath}/${fileName}`;

        return stat(filePath)
          .then(() => resolve(streamPackage(repo, filePath)))
          .catch(() => {
            const req = request(getUpstreamUrl(repo, name, version));
            req.pause();

            return req
              .on("error", error => {
                logger.error(
                  `Network error when fetching package ${name}@${version} from upstream`
                );
                reject(error);
              })
              .on("response", response => {
                const statusCode = response.statusCode;

                if (statusCode < 200 || statusCode >= 300) {
                  const error = new Error(
                    `Got ${statusCode} when fetching package from upstream`
                  );
                  error.statusCode = statusCode;
                  return reject(error);
                }

                return mkdirp(directoryPath)
                  .then(() => {
                    req.pipe(
                      createWriteStream(filePath)
                        .on("error", error => {
                          logger.error(
                            `Error when writing package ${name}@${version} to storage`
                          );
                          reject(error);
                        })
                        .on("finish", () =>
                          resolve(streamPackage(repo, filePath))
                        )
                    );

                    return req.resume();
                  })
                  .catch(error => reject(error));
              });
          });
      });
  });

module.exports = {
  getMainPackage,
  getVersionedPackage
};
