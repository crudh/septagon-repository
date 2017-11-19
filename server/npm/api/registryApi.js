const logger = require("winston");

const getRegistryInfo = (req, res) =>
  res.json({ registry_name: req.params.repo });

const ping = (req, res) => res.json({});

const login = (req, res) => {
  const paramName = req.params.username;
  const { name, password } = req.body;

  if (paramName !== name || password !== "test") {
    logger.error(`Failed login: ${paramName}`);
    return res.status(401).json({ ok: false });
  }

  return res.status(201).json({ token: "kakatoken", ok: true });

  // logger.error(`Failed login: ${req.url}, ${req.body}`);
  // res.status(500).send({ message: "Error" });
  // res.set("Content-Type", "application/json");
  // res.send({});
};

module.exports = {
  getRegistryInfo,
  ping,
  login
};
