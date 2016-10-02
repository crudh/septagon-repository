export default (app, api) => {
  app.get('/npm/main/:name/:version?', api.package.fetchPackage);
  app.get('/npm/main/:name/-/:distFile', api.package.fetchDistFile);
  app.get('/npm/main/-/all*', api.package.searchPackage);

  app.get('/npm/main', api.registry.fetchRegistryInfo);
  app.get('/npm/-/ping', api.registry.ping);
};
