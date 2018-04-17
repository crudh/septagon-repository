# septagon-repository
A simple Node.js based npm repository manager and proxy. 

# Use caution
This is currently an incomplete and untested side project I work on when I feel like it and have the time. I might publish it later when I have completed support for `npm publish`, added documentation and extended the tests.

Also most npm operations are reverese engineered and are only tested with a small set of packages so they are not verified to handle all npm packages.

## Run in production mode
 * `npm install`
 * `npm run build`
 * `npm start`

## Run in development mode
 * `npm install`
 * `npm run dev`

## Setup npm client to use the registry
This uses the configured `main` repository:
 * `npm config set registry http://localhost:3000/registry/main`

## Configuration
 * Edit `config/default.json` or override in `config/production.json`
