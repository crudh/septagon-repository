const config = require("config")
const request = require("supertest")
const { app, server } = require("../../server")
const { mkdirp } = require("../../utils/promisified")
const { getServerUrl } = require("../../utils/urls")

const serverLocation = config.get("server.location")
const localUrlRegex = new RegExp(`^${getServerUrl(serverLocation)}`, "g")

const binaryParser = (res, callback) => {
  res.setEncoding("binary")
  let data = ""
  res.on("data", chunk => {
    data += chunk
  })
  res.on("end", () => {
    callback(null, new Buffer(data, "binary"))
  })
}

const getMainPackageFile = done =>
  request(app)
    .get("/npm/main/seamless-immutable-mergers")
    .expect(200)
    .expect("Content-Type", "application/json; charset=utf-8")
    .end((err, res) => {
      if (err) return done(err)

      const { name, versions } = res.body
      expect(name).toEqual("seamless-immutable-mergers")
      expect(versions).toEqual(expect.any(Object))

      Object.keys(versions).forEach(key => {
        const version = versions[key]
        expect(version.dist).toEqual(expect.any(Object))

        const { tarball } = version.dist
        expect(tarball).toEqual(expect.any(String))
        expect(tarball).toMatch(localUrlRegex)
      })

      return done()
    })

const getMainPackageFileLocalOverride = done =>
  mkdirp("./tmp/test/localoverride/local/seamless-immutable-mergers")
    .then(() => {
      request(app)
        .get("/npm/localoverride/seamless-immutable-mergers")
        .expect(404, done)
    })
    .catch(done)

const getMainPackageFileNoUpstream = done =>
  request(app)
    .get("/npm/standalone/seamless-immutable-mergers")
    .expect(404, done)

const getMainPackageFileNonexistingRepo = done =>
  request(app)
    .get("/npm/nonexisting/seamless-immutable-mergers")
    .expect(404, done)

const getMainPackageFilePrivateAuthMissing = done =>
  request(app)
    .get("/npm/private/seamless-immutable-mergers")
    .expect(401)
    .end(done)

const getMainPackageFilePrivateAuthBad = done =>
  request(app)
    .get("/npm/private/seamless-immutable-mergers")
    .auth("tester", "testWrong")
    .expect(401)
    .end(done)

const getMainPackageFilePrivateAuthOk = done =>
  request(app)
    .get("/npm/private/seamless-immutable-mergers")
    .auth("tester", "test")
    .expect(200)
    .expect("Content-Type", "application/json; charset=utf-8")
    .end(done)

const getVersionedPackageFile = done =>
  request(app)
    .get("/npm/main/seamless-immutable-mergers/5.0.0")
    .expect(200)
    .expect("Content-Type", "application/json; charset=utf-8")
    .end((err, res) => {
      if (err) return done(err)

      const { name, version, dist } = res.body
      expect(name).toEqual("seamless-immutable-mergers")
      expect(version).toEqual("5.0.0")
      expect(dist).toEqual(expect.any(Object))

      const { tarball } = dist
      expect(tarball).toEqual(expect.any(String))
      expect(tarball).toMatch(localUrlRegex)

      return done()
    })

const getVersionedPackageFileLocalOverride = done =>
  mkdirp("./tmp/test/localoverride/local/seamless-immutable-mergers")
    .then(() => {
      request(app)
        .get("/npm/localoverride/seamless-immutable-mergers/5.0.0")
        .expect(404, done)
    })
    .catch(done)

const getVersionedPackageFileNoUpstream = done =>
  request(app)
    .get("/npm/standalone/seamless-immutable-mergers/5.0.0")
    .expect(404, done)

const getVersionedPackageFileNonexistingRepo = done =>
  request(app)
    .get("/npm/nonexisting/seamless-immutable-mergers/5.0.0")
    .expect(404, done)

const getVersionedPackageFilePrivateAuthMissing = done =>
  request(app)
    .get("/npm/private/seamless-immutable-mergers/5.0.0")
    .expect(401)
    .end(done)

const getVersionedPackageFilePrivateAuthBad = done =>
  request(app)
    .get("/npm/private/seamless-immutable-mergers/5.0.0")
    .auth("tester", "testWrong")
    .expect(401)
    .end(done)

const getVersionedPackageFilePrivateAuthOk = done =>
  request(app)
    .get("/npm/private/seamless-immutable-mergers/5.0.0")
    .auth("tester", "test")
    .expect(200)
    .expect("Content-Type", "application/json; charset=utf-8")
    .end(done)

const getPackageDistFile = done =>
  request(app)
    .get(
      "/npm/main/seamless-immutable-mergers/-/seamless-immutable-mergers-5.0.0.tgz"
    )
    .expect(200)
    .expect("Content-Type", "application/octet-stream")
    .parse(binaryParser)
    .end((err, res) => {
      if (err) return done(err)

      expect(Buffer.isBuffer(res.body)).toEqual(true)

      return done()
    })

const getPackageDistFileLocalOverride = done =>
  mkdirp("./tmp/test/localoverride/local/seamless-immutable-mergers")
    .then(() => {
      request(app)
        .get(
          "/npm/localoverride/seamless-immutable-mergers/-/seamless-immutable-mergers-5.0.0.tgz"
        )
        .expect(404, done)
    })
    .catch(done)

const getPackageDistFileNonexistingRepo = done =>
  request(app)
    .get(
      "/npm/nonexisting/seamless-immutable-mergers/-/seamless-immutable-mergers-5.0.0.tgz"
    )
    .expect(404, done)

const getPackageDistFileNoUpstream = done =>
  request(app)
    .get(
      "/npm/standalone/seamless-immutable-mergers/-/seamless-immutable-mergers-5.0.0.tgz"
    )
    .expect(404, done)

const getPackageDistFilePrivateAuthMissing = done =>
  request(app)
    .get(
      "/npm/private/seamless-immutable-mergers/-/seamless-immutable-mergers-5.0.0.tgz"
    )
    .expect(401)
    .end(done)

const getPackageDistFilePrivateAuthBad = done =>
  request(app)
    .get(
      "/npm/private/seamless-immutable-mergers/-/seamless-immutable-mergers-5.0.0.tgz"
    )
    .auth("tester", "testWrong")
    .expect(401)
    .end(done)

const getPackageDistFilePrivateAuthOk = done =>
  request(app)
    .get(
      "/npm/private/seamless-immutable-mergers/-/seamless-immutable-mergers-5.0.0.tgz"
    )
    .auth("tester", "test")
    .expect(200)
    .expect("Content-Type", "application/octet-stream")
    .end(done)

const searchPackageNoUpstream = done =>
  request(app)
    .get("/npm/standalone/-/all")
    .expect(404, done)

describe("Packages", () => {
  describe("API", () => {
    describe("Get main package file", () => {
      it("should be able to get a main package file", getMainPackageFile)
      it(
        "should be able to get a main package file when it is cached",
        getMainPackageFile
      )
      it(
        "should return 404 if an empty directory is located in the local sub dir",
        getMainPackageFileLocalOverride
      )
      it(
        "should return 404 if not stored locally and no upstream is defined",
        getMainPackageFileNoUpstream
      )
      it(
        "should return 404 if the repo doesn't exist",
        getMainPackageFileNonexistingRepo
      )
      it(
        "should return 401 if the repo is private an no auth is provided",
        getMainPackageFilePrivateAuthMissing
      )
      it(
        "should return 401 if the repo is private an bad auth is provided",
        getMainPackageFilePrivateAuthBad
      )
      it(
        "should return 200 if the repo is private an ok auth is provided",
        getMainPackageFilePrivateAuthOk
      )
    })

    describe("Get versioned package file", () => {
      it(
        "should be able to get a package file by version",
        getVersionedPackageFile
      )
      it(
        "should be able to get a package file by version when it is cached",
        getVersionedPackageFile
      )
      it(
        "should return 404 if an empty directory is located in the local sub dir",
        getVersionedPackageFileLocalOverride
      )
      it(
        "should return 404 if not stored locally and no upstream is defined",
        getVersionedPackageFileNoUpstream
      )
      it(
        "should return 404 if the repo doesn't exist",
        getVersionedPackageFileNonexistingRepo
      )
      it(
        "should return 401 if the repo is private an no auth is provided",
        getVersionedPackageFilePrivateAuthMissing
      )
      it(
        "should return 401 if the repo is private an bad auth is provided",
        getVersionedPackageFilePrivateAuthBad
      )
      it(
        "should return 200 if the repo is private an ok auth is provided",
        getVersionedPackageFilePrivateAuthOk
      )
    })

    describe("Get package dist file", () => {
      it("should be able to get a package distfile", getPackageDistFile)
      it(
        "should be able to get a package distfile when it is cached",
        getPackageDistFile
      )
      it(
        "should return 404 if an empty directory is located in the local sub dir",
        getPackageDistFileLocalOverride
      )
      it(
        "should return 404 if not stored locally and no upstream is defined",
        getPackageDistFileNoUpstream
      )
      it(
        "should return 404 if the repo doesn't exist",
        getPackageDistFileNonexistingRepo
      )
      it(
        "should return 401 if the repo is private an no auth is provided",
        getPackageDistFilePrivateAuthMissing
      )
      it(
        "should return 401 if the repo is private an bad auth is provided",
        getPackageDistFilePrivateAuthBad
      )
      it(
        "should return 200 if the repo is private an ok auth is provided",
        getPackageDistFilePrivateAuthOk
      )
    })

    describe("Search for package", () => {
      it("should not work if no upstream is defined", searchPackageNoUpstream)
    })
  })
})

afterAll(() => server.close())
