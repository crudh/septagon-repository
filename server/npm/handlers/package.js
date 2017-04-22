const config = require("config");
const es = require("event-stream");
const fs = require("fs");
const mkdirp = require("mkdirp");
const request = require("request");
const { Transform } = require("stream");
const logger = require("winston");
const { getServerUrl } = require("../../utils/urls");

const serverConfig = config.get("server");

class TarballReplacer extends Transform {
  constructor(repo) {
    super({ objectMode: true });

    const upstreamHost = repo.upstream.replace(/https?:\/\//, "");
    this.upstreamRegExp = new RegExp(`https?://${upstreamHost}`, "g");
    this.repoId = repo.id;
  }

  _transform(line, encoding, done) {
    this.push(line.replace(this.upstreamRegExp, `${getServerUrl(serverConfig.location)}/npm/${this.repoId}`));

    done();
  }
}

const getFileName = (name, version) => (version ? `${name}-${version}` : name);

const getUpstreamUrl = (repo, name, version) => {
  const baseUrl = `${repo.upstream}/${name}`;
  if (!version) return baseUrl;

  return `${baseUrl}/${version}`;
};

const checkPackageFile = (repo, name, version, callback) => {
  const fileName = getFileName(name, version);
  fs.stat(`${repo.storage}/${name}/${fileName}`, err => callback(err));
};

const streamPackage = (repo, path, callback) => {
  const readStream = fs.createReadStream(path).pipe(es.split()).pipe(new TarballReplacer(repo));
  callback(null, readStream);
};

const getPackage = (repo, name, version, callback) => {
  const fileName = getFileName(name, version);
  const directoryPath = `${repo.storage}/${name}`;
  const filePath = `${directoryPath}/${fileName}`;

  return checkPackageFile(repo, name, version, errFile => {
    if (!errFile) return streamPackage(repo, filePath, callback);
    if (!repo.upstream) return callback({ statusCode: 404 });

    const req = request(getUpstreamUrl(repo, name, version));
    req.pause();

    return req
      .on("error", errRequest => {
        logger.error(`Network error when fetching package ${name}@${version || ""} from upstream`);
        callback(errRequest);
      })
      .on("response", response => {
        const statusCode = response.statusCode;

        if (statusCode < 200 || statusCode >= 300) {
          const error = new Error(`Got ${statusCode} when fetching package from upstream`);
          error.statusCode = statusCode;
          return callback(error);
        }

        return mkdirp(directoryPath, errDir => {
          if (errDir) return callback(errDir);

          req.pipe(
            fs
              .createWriteStream(filePath)
              .on("error", errWrite => {
                logger.error(`Error when writing package ${name}@${version || ""} to storage`);
                callback(errWrite);
              })
              .on("finish", () => streamPackage(repo, filePath, callback))
          );

          return req.resume();
        });
      });
  });
};

module.exports = {
  getPackage
};
