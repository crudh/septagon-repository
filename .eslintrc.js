module.exports = {
  plugins: ["prettier"],
  extends: ["eslint:recommended", "prettier"],
  parserOptions: {
    ecmaVersion: 2017,
    ecmaFeatures: {
      experimentalObjectRestSpread: true
    }
  },
  env: {
    node: true,
    es6: true,
    jest: true
  },
  rules: {
    "prettier/prettier": "error",
    "no-unused-vars": ["error", { ignoreRestSiblings: true }]
  }
}
