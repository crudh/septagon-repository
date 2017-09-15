const config = require("config");
const es = require("event-stream");
const fs = require("fs");
const request = require("request");
const { Transform } = require("stream");
const { promisify } = require("util");
const logger = require("winston");
const { getServerUrl } = require("../../utils/urls");

const mkdirp = promisify(require("mkdirp"));
const stat = promisify(fs.stat);

const serverConfig = config.get("server");

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
        `${getServerUrl(serverConfig.location)}/npm/${this.repoId}`
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

const checkPackageFile = (repo, name, version) =>
  stat(`${repo.storage}/${name}/${getFileName(name, version)}`);

const streamPackage = (repo, path) =>
  fs
    .createReadStream(path)
    .pipe(es.split())
    .pipe(new TarballReplacer(repo));

const getMainPackage = (repo, name) =>
  new Promise((resolve, reject) => {
    const fileName = getFileName(name);
    const directoryPath = `${repo.storage}/${name}`;
    const filePath = `${directoryPath}/${fileName}`;

    if (!repo.upstream) {
      return checkPackageFile(repo, name)
        .then(() => resolve(streamPackage(repo, filePath)))
        .catch(() => reject({ statusCode: 404 }));
    }

    const req = request(getUpstreamUrl(repo, name));
    req.pause();

    return req
      .on("error", errRequest => {
        logger.error(
          `Network error when fetching package ${name} from upstream, checking local cache`
        );

        return checkPackageFile(repo, name)
          .then(() => resolve(streamPackage(repo, filePath)))
          .catch(() => reject(errRequest));
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
              fs
                .createWriteStream(filePath)
                .on("error", errWrite => {
                  logger.error(`Error when writing package ${name} to storage`);
                  reject(errWrite);
                })
                .on("finish", () => resolve(streamPackage(repo, filePath)))
            );

            return req.resume();
          })
          .catch(error => reject(error));
      });
  });

const getVersionedPackage = (repo, name, version) =>
  new Promise((resolve, reject) => {
    const fileName = getFileName(name, version);
    const directoryPath = `${repo.storage}/${name}`;
    const filePath = `${directoryPath}/${fileName}`;

    return checkPackageFile(repo, name, version)
      .then(() => resolve(streamPackage(repo, filePath)))
      .catch(() => {
        if (!repo.upstream) return reject({ statusCode: 404 });

        const req = request(getUpstreamUrl(repo, name, version));
        req.pause();

        return req
          .on("error", errRequest => {
            logger.error(
              `Network error when fetching package ${name}@${version} from upstream`
            );
            reject(errRequest);
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
                  fs
                    .createWriteStream(filePath)
                    .on("error", errWrite => {
                      logger.error(
                        `Error when writing package ${name}@${version} to storage`
                      );
                      reject(errWrite);
                    })
                    .on("finish", () => resolve(streamPackage(repo, filePath)))
                );

                return req.resume();
              })
              .catch(error => reject(error));
          });
      });
  });

module.exports = {
  getMainPackage,
  getVersionedPackage
};
