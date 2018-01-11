const request = require("supertest")
const { app, server } = require("../../server")

const getRegistryInfo = done =>
  request(app)
    .get("/npm/main")
    .expect(200, { registry_name: "main" })
    .end(done)

const getRegistryInfoMissingRepo = done =>
  request(app)
    .get("/npm/nonexisting")
    .expect(404)
    .end(done)

const ping = done =>
  request(app)
    .get("/npm/-/ping")
    .expect(200, {})
    .end(done)

const loginSuccess = done =>
  request(app)
    .put("/npm/-/user/org.couchdb.user:tester")
    .send({ name: "tester", password: "test" })
    .expect(201, { ok: true })
    .end(done)

const loginWrongPassword = done =>
  request(app)
    .put("/npm/-/user/org.couchdb.user:tester")
    .send({ name: "tester", password: "testWrong" })
    .expect(401, { ok: false })
    .end(done)

describe("Registry", () => {
  describe("API", () => {
    describe("Get registry info", () => {
      it("should give back basic info on success", getRegistryInfo)
      it(
        "should answer with 404 if the repo doesn't exist",
        getRegistryInfoMissingRepo
      )
    })

    describe("Ping", () => {
      it("should respond to ping", ping)
    })

    describe("Login", () => {
      it(
        "should work to login with a correct username and password",
        loginSuccess
      )
      it(
        "should not work to login with a correct username and incorrect password",
        loginWrongPassword
      )
      it("should not work to login with an incorrect username but existing password", () => {})
      it("should not work to login with an incorrect username and password", () => {})
      it("should not work to login with a correct username in the path but incorrect in the body", () => {})
      it("should not work to login with an incorrect username in the path but correct in the body", () => {})
    })
  })
})

afterAll(() => server.close())
