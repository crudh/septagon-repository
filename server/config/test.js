import defaultConfig from './default';

const config = Object.assign({}, defaultConfig, {
  storage: './tmp/testRepository',
  logFile: null
});

export default config;
