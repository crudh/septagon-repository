export default (app, handlers) => {
  app.get('/npm/main/:name/:version?', handlers.package.fetchPackage);
  app.get('/npm/main/:name/-/:distFile', handlers.package.fetchDistFile);
  app.get('/npm/main/-/all*', handlers.package.searchPackage);

  app.get('/npm/main', handlers.registry.fetchRegistryInfo);
};
