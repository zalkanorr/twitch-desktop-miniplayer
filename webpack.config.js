const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
  target: 'electron-renderer',
  mode: 'production',
  entry: './app/src/entry.js',
  output: {
    path: __dirname + '/app/build',
    publicPath: 'build/',
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader'
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: 'file-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.scss/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      }
    ]
  },
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.runtime.esm.js'
    }
  },
  plugins: [new VueLoaderPlugin()]
};
