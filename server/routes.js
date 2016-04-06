export default (app, handlers) => {
  app.get('/npm/main/:name/:version?', handlers.package.fetchPackage);
  app.get('/npm/main/:name/-/:distFile', handlers.package.fetchDistFile);
  app.get('/registry/main/-/all*', handlers.package.searchPackage);
};
