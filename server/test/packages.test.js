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

const fetchMainPackageFile = done => {
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

const fetchMainPackageFileNoUpstream = done => {
  request(app).get("/npm/standalone/seamless-immutable-mergers").expect(404).end(done);
};

const fetchMainPackageFileNonexistingRepo = done => {
  request(app).get("/npm/nonexisting/seamless-immutable-mergers").expect(404).end(done);
};

const fetchVersionedPackageFile = done => {
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

const fetchVersionedPackageFileNoUpstream = done => {
  request(app).get("/npm/standalone/seamless-immutable-mergers/5.0.0").expect(404).end(done);
};

const fetchVersionedPackageFileNonexistingRepo = done => {
  request(app).get("/npm/nonexisting/seamless-immutable-mergers/5.0.0").expect(404).end(done);
};

const fetchPackageDistFile = done => {
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

const fetchPackageDistFileNonexistingRepo = done => {
  request(app)
    .get("/npm/nonexisting/seamless-immutable-mergers/-/seamless-immutable-mergers-5.0.0.tgz")
    .expect(404)
    .end(done);
};

const fetchPackageDistFileNoUpstream = done => {
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
    describe("Fetch main package file", () => {
      it("should be able to fetch a main package file", fetchMainPackageFile);
      it("should be able to fetch a main package file when it is cached", fetchMainPackageFile);
      it("should return 404 if not stored locally and no upstream is defined", fetchMainPackageFileNoUpstream);
      it("should return 404 if the repo doesn't exist", fetchMainPackageFileNonexistingRepo);
    });

    describe("Fetch versioned package file", () => {
      it("should be able to fetch a package file by version", fetchVersionedPackageFile);
      it("should be able to fetch a package file by version when it is cached", fetchVersionedPackageFile);
      it("should return 404 if not stored locally and no upstream is defined", fetchVersionedPackageFileNoUpstream);
      it("should return 404 if the repo doesn't exist", fetchVersionedPackageFileNonexistingRepo);
    });

    describe("Fetch package dist file", () => {
      it("should be able to fetch a package distfile", fetchPackageDistFile);
      it("should be able to fetch a package distfile when it is cached", fetchPackageDistFile);
      it("should return 404 if not stored locally and no upstream is defined", fetchPackageDistFileNoUpstream);
      it("should return 404 if the repo doesn't exist", fetchPackageDistFileNonexistingRepo);
    });

    describe("Search for package", () => {
      it("should not work if no upstream is defined", searchPackageNoUpstream);
    });
  });
});

afterAll(() => server.close());
