/* eslint import/no-extraneous-dependencies: "off" */
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const nodeEnv = process.env.NODE_ENV || 'development';

const config = {
  entry: {
    main: './client/main.js',
    vendor: ['react', 'react-dom', 'react-tap-event-plugin', 'react-router',
      'react-router-redux', 'react-redux', 'redux', 'redux-logger', 'redux-thunk']
  },
  output: {
    path: './public/build',
    filename: '[chunkhash].[name].js'
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'manifest']
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
