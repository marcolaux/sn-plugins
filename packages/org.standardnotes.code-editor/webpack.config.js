const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  entry: [path.resolve(__dirname, 'src', 'main.js'), path.resolve(__dirname, 'src', 'main.scss')],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                includePaths: ['src/main.scss'],
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'node_modules/codemirror/lib'),
          to: path.resolve(__dirname, 'dist/codemirror/lib'),
        },
        {
          from: path.resolve(__dirname, 'node_modules/codemirror/mode'),
          to: path.resolve(__dirname, 'dist/codemirror/mode'),
        },
        {
          from: path.resolve(__dirname, 'node_modules/codemirror/addon'),
          to: path.resolve(__dirname, 'dist/codemirror/addon'),
        },
        {
          from: path.resolve(__dirname, 'node_modules/codemirror/keymap/vim.js'),
          to: path.resolve(__dirname, 'dist/codemirror/keymap'),
        },
        {
          from: require.resolve('@standardnotes/component-relay/dist/dist.js'),
          to: path.resolve(__dirname, 'dist/lib/component-relay.js'),
        },
        { from: require.resolve('sn-stylekit/dist/stylekit.css'), to: path.resolve(__dirname, 'dist/stylekit.css') },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
  ],
}
