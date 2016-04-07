export const fetchRegistryInfo = (req, res) => {
  res.set('Content-Type', 'application/json');
  res.send({ registry_name: 'main' });
};
