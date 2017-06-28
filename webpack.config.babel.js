import webpack from 'webpack';
import path from 'path';

const config = {
  entry: [
    (process.env.NODE_ENV === 'production' ? null :
    'webpack-dev-server/client?http://localhost:8080'),
    './src/index',
  ].filter(entry => !!entry),
  module: {
    loaders: [
      {
        test: /\.(js(x)?$)/,
        exclude: /node_modules/,
        loader: 'react-hot-loader!babel-loader',
      },
      {
        test: /\.(css|styl)$/,
        exclude: /node_modules/,
        loader: 'style-loader!css-loader!stylus-loader',
      },
      {
        test: /\.(gif|jpg|png|svg|eot|otf|ttf|woff(2)?)$/,
        exclude: /node_modules/,
        loader: 'url-loader?limit=100000&name=/[name].[ext]',
      },
    ],
  },
  output: { path: path.join(__dirname, '/dist'), filename: 'bundle.js' },
  devServer: {
    contentBase: 'dist',
    compress: true,
    historyApiFallback: true,
    hot: true,
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
  devtool: 'source-map',
};

export default config;
