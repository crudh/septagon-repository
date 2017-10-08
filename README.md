# septagon-repository
A simple Node.js based npm repository manager and proxy.

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
