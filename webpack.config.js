/* eslint import/no-extraneous-dependencies: "off" */
const path = require('path');
const webpack = require('webpack');

const nodeEnv = process.env.NODE_ENV || 'development';

const config = {
  entry: path.join(__dirname, 'client/main.js'),
  output: {
    path: path.join(__dirname, 'public/build'),
    filename: 'bundle.js'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(nodeEnv)
    })
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader?cacheDirectory'
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        loader: 'style-loader!css-loader'
      }
    ]
  }
};

if (nodeEnv === 'production') {
  config.plugins.push(
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    })
  );
}

if (nodeEnv === 'development') {
  config.devtool = 'cheap-module-source-map';

  config.plugins.push(
    new webpack.NoErrorsPlugin()
  );
}

module.exports = config;
