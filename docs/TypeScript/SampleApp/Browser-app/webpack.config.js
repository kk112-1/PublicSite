const { resolve } = require('path')

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  devtool: 'inline-source-map',
  entry: resolve(__dirname, 'ts/index.ts'),
  output: {
    filename: 'index.js',
    path: resolve(__dirname, 'dist/js'),
  },
  devServer: {
    hot: false,
    port: 3000,
    static: {
      directory: resolve(__dirname, 'dist'),
    },
    devMiddleware: {
      writeToDisk: true,
    }
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts/,
        use: {
          loader: 'ts-loader',
        },
      },
    ],
  }
}
