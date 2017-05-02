const getRegistryInfo = (req, res) => {
  const repo = req.params.repo;

  res.set("Content-Type", "application/json");
  res.send({ registry_name: repo });
};

const ping = (req, res) => {
  res.set("Content-Type", "application/json");
  res.send({});
};

module.exports = {
  getRegistryInfo,
  ping
};
