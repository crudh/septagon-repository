const { validateServerConfig } = require("./validateConfig")

const defaultConfig = {
  server: {
    location: {
      protocol: "http",
      host: "localhost",
      port: "3000"
    },
    repos: {
      main: {
        id: "main",
        upstream: "https://registry.npmjs.org",
        storage: "./tmp/testRepository",
        public: false
      },
      standalone: {
        id: "standalone",
        storage: "./tmp/standaloneRepository",
        public: false
      }
    },
    log: {},
    users: {
      c: {
        salt: "salt",
        hash: "hash"
      }
    }
  }
}

const emptyRepoConfig = {
  server: {
    location: {
      protocol: "http",
      host: "localhost",
      port: "3000"
    },
    repos: {
      main: {}
    },
    log: {},
    users: {}
  }
}

describe("Validate config", () => {
  describe("Server config", () => {
    it("should validate an empty config with all errors", () => {
      expect(validateServerConfig({}).length).toEqual(14)
    })

    it("should validate an empty repo with all errors", () => {
      expect(validateServerConfig(emptyRepoConfig.server).length).toEqual(5)
    })

    it("should validate incomplete user with all errors", () => {
      expect(
        validateServerConfig({
          ...defaultConfig.server,
          users: { c: {} }
        }).length
      ).toEqual(2)
    })

    it("should validate a correct file without errors", () => {
      expect(validateServerConfig(defaultConfig.server).length).toEqual(0)
    })
  })
})
