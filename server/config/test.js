import defaultConfig from './default';

const config = Object.assign({}, defaultConfig, {
  storage: './testRepository',
  logFile: null
});

export default config;
