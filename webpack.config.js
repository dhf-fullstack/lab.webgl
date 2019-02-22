module.exports = {
  output: {
    filename: 'bundle.js'
  },
  devtool: 'eval-source-map', // for separate file 'source-map',
  module: {
    rules: [
      {
        test: /\.glsl$/i,
        use: 'raw-loader',
      },
    ],
  },
};