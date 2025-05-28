// webpack.prod.js
const common = require('./webpack.common.js');
const { merge } = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = merge(common, {
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        ],
      },
      // Add the image rule here
      {
        test: /\.(png|jpe?g|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [new CleanWebpackPlugin(), new MiniCssExtractPlugin()],
});
