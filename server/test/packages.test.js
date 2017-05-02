const config = require("config");
const request = require("supertest");
const { app, server } = require("../server");
const { getServerUrl } = require("../utils/urls");

const serverConfig = config.get("server");
const localUrlRegex = new RegExp(`^${getServerUrl(serverConfig.location)}`, "g");

const binaryParser = (res, callback) => {
  res.setEncoding("binary");
  let data = "";
  res.on("data", chunk => {
    data += chunk;
  });
  res.on("end", () => {
    callback(null, new Buffer(data, "binary"));
  });
};

const getMainPackageFile = done => {
  request(app)
    .get("/npm/main/seamless-immutable-mergers")
    .expect(200)
    .expect("Content-Type", "application/json")
    .end((err, res) => {
      if (err) return done(err);

      const { name, versions } = res.body;
      expect(name).toEqual("seamless-immutable-mergers");
      expect(versions).toEqual(expect.any(Object));

      Object.keys(versions).forEach(key => {
        const version = versions[key];
        expect(version.dist).toEqual(expect.any(Object));

        const { tarball } = version.dist;
        expect(tarball).toEqual(expect.any(String));
        expect(tarball).toMatch(localUrlRegex);
      });

      return done();
    });
};

const getMainPackageFileNoUpstream = done => {
  request(app).get("/npm/standalone/seamless-immutable-mergers").expect(404).end(done);
};

const getMainPackageFileNonexistingRepo = done => {
  request(app).get("/npm/nonexisting/seamless-immutable-mergers").expect(404).end(done);
};

const getVersionedPackageFile = done => {
  request(app)
    .get("/npm/main/seamless-immutable-mergers/5.0.0")
    .expect(200)
    .expect("Content-Type", "application/json")
    .end((err, res) => {
      if (err) return done(err);

      const { name, version, dist } = res.body;
      expect(name).toEqual("seamless-immutable-mergers");
      expect(version).toEqual("5.0.0");
      expect(dist).toEqual(expect.any(Object));

      const { tarball } = dist;
      expect(tarball).toEqual(expect.any(String));
      expect(tarball).toMatch(localUrlRegex);

      return done();
    });
};

const getVersionedPackageFileNoUpstream = done => {
  request(app).get("/npm/standalone/seamless-immutable-mergers/5.0.0").expect(404).end(done);
};

const getVersionedPackageFileNonexistingRepo = done => {
  request(app).get("/npm/nonexisting/seamless-immutable-mergers/5.0.0").expect(404).end(done);
};

const getPackageDistFile = done => {
  request(app)
    .get("/npm/main/seamless-immutable-mergers/-/seamless-immutable-mergers-5.0.0.tgz")
    .expect(200)
    .expect("Content-Type", "application/octet-stream")
    .parse(binaryParser)
    .end((err, res) => {
      if (err) return done(err);

      expect(Buffer.isBuffer(res.body)).toEqual(true);

      return done();
    });
};

const getPackageDistFileNonexistingRepo = done => {
  request(app)
    .get("/npm/nonexisting/seamless-immutable-mergers/-/seamless-immutable-mergers-5.0.0.tgz")
    .expect(404)
    .end(done);
};

const getPackageDistFileNoUpstream = done => {
  request(app)
    .get("/npm/standalone/seamless-immutable-mergers/-/seamless-immutable-mergers-5.0.0.tgz")
    .expect(404)
    .end(done);
};

const searchPackageNoUpstream = done => {
  request(app).get("/npm/standalone/-/all").expect(404).end(done);
};

describe("Packages", () => {
  describe("API", () => {
    describe("Get main package file", () => {
      it("should be able to get a main package file", getMainPackageFile);
      it("should be able to get a main package file when it is cached", getMainPackageFile);
      it("should return 404 if not stored locally and no upstream is defined", getMainPackageFileNoUpstream);
      it("should return 404 if the repo doesn't exist", getMainPackageFileNonexistingRepo);
    });

    describe("Get versioned package file", () => {
      it("should be able to get a package file by version", getVersionedPackageFile);
      it("should be able to get a package file by version when it is cached", getVersionedPackageFile);
      it("should return 404 if not stored locally and no upstream is defined", getVersionedPackageFileNoUpstream);
      it("should return 404 if the repo doesn't exist", getVersionedPackageFileNonexistingRepo);
    });

    describe("Get package dist file", () => {
      it("should be able to get a package distfile", getPackageDistFile);
      it("should be able to get a package distfile when it is cached", getPackageDistFile);
      it("should return 404 if not stored locally and no upstream is defined", getPackageDistFileNoUpstream);
      it("should return 404 if the repo doesn't exist", getPackageDistFileNonexistingRepo);
    });

    describe("Search for package", () => {
      it("should not work if no upstream is defined", searchPackageNoUpstream);
    });
  });
});

afterAll(() => server.close());
