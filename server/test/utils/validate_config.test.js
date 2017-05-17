const config = require("config");
const { validateServerConfig } = require("../../utils/validate_config");

const serverConfig = config.get("server");

describe("Validate config", () => {
  describe("Server config", () => {
    it("should validate an empty config with all errors", () => {
      expect(validateServerConfig({}).length).toEqual(7);
    });

    it("should validate a correct file without errors", () => {
      expect(validateServerConfig(serverConfig).length).toEqual(0);
    });
  });
});
