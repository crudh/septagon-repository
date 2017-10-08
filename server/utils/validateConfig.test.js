const { validateServerConfig } = require("./validateConfig");

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
        storage: "./tmp/testRepository"
      },
      standalone: {
        id: "standalone",
        storage: "./tmp/standaloneRepository"
      }
    }
  }
};

const emptyRepoConfig = {
  server: {
    location: {
      protocol: "http",
      host: "localhost",
      port: "3000"
    },
    repos: {
      main: {}
    }
  }
};

describe("Validate config", () => {
  describe("Server config", () => {
    it("should validate an empty config with all errors", () => {
      expect(validateServerConfig({}).length).toEqual(10);
    });

    it("should validate an empty repo with all errors", () => {
      expect(validateServerConfig(emptyRepoConfig.server).length).toEqual(3);
    });

    it("should validate a correct file without errors", () => {
      expect(validateServerConfig(defaultConfig.server).length).toEqual(0);
    });
  });
});
