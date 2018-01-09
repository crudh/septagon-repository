module.exports = {
  plugins: ["prettier"],
  extends: ["eslint:recommended", "prettier"],
  parserOptions: {
    ecmaVersion: 2017
  },
  env: {
    node: true,
    es6: true,
    jest: true
  },
  rules: {
    "prettier/prettier": "error"
  }
}