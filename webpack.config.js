/* eslint import/no-extraneous-dependencies: "off" */
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const nodeEnv = process.env.NODE_ENV || 'development';

const isExternal = module => {
  const userRequest = module.userRequest;

  if (typeof userRequest !== 'string') return false;
  return userRequest.indexOf('node_modules') >= 0;
};

const config = {
  entry: {
    main: './client/main.js'
  },
  output: {
    path: './public/build',
    filename: '[chunkhash].[name].js'
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      names: 'vendor',
      minChunks: isExternal
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest'
    }),
    new HtmlWebpackPlugin({
      template: './client/template.html',
      filename: '../index.html'
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader?cacheDirectory'
      }
    ]
  },
  devtool: 'cheap-module-source-map'
};

if (nodeEnv === 'development') {
  config.plugins.push(
    new webpack.NoEmitOnErrorsPlugin()
  );
}

module.exports = config;
