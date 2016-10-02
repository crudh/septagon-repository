export const fetchRegistryInfo = (req, res) => {
  const repo = req.params.repo;

  res.set('Content-Type', 'application/json');
  res.send({ registry_name: repo });
};

export const ping = (req, res) => {
  res.set('Content-Type', 'application/json');
  res.send({});
};
