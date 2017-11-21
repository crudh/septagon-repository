const { crypto } = require("./promisified");

const tokenStore = new Map();

const setToken = (token, name) => tokenStore.set(token, name);

const getName = (token, name) =>
  name !== undefined && tokenStore.get(token) === name;

const createToken = () =>
  new Promise((resolve, reject) =>
    crypto
      .randomBytes(48)
      .then(buffer => resolve(buffer.toString("base64")))
      .catch(reject)
  );

module.exports = {
  setToken,
  getName,
  createToken
};
