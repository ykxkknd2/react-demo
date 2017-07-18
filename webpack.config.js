var path = require('path');
var webpack = require('webpack');
var fs = require('fs');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var AssetsPlugin = require('assets-webpack-plugin');
var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
var glob = require('glob');
var rimraf = require('rimraf');
var isProduction = process.env.NODE_ENV === 'production';

var config = {
  entry: {vendor: ['react', 'reactDom', 'jquery']},
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: isProduction? 'js/[name].[chunkhash].js' : 'js/[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
            // @remove-on-eject-begin
            babelrc: false,
            presets: ['babel-preset-react-app'],
            // @remove-on-eject-end
            // This is a feature of `babel-loader` for webpack (not Babel itself).
            //It enables caching results in ./node_modules/.cache/babel-loader/
            // directory for faster rebuilds.
            cacheDirectory: true
        }
      },
      {
          test: /\.css$/,
          loader: isProduction? ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' }) : 'style-loader!css-loader',
      },
      {
        test: /\.(png|jpg|gif|svg|ttf)$/,
        loader: 'file-loader',
        options: {
            name: 'img/[name].[hash].[ext]'
        }
      }
    ]
  },
  resolve: {
    alias: {
        'react$': 'react/dist/react.min.js',
        'reactDom$': 'react-dom/dist/react-dom.min.js',
        'jquery$' : 'jquery/dist/jquery.min.js'
    }
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true,
    port : 3003
  },
  performance: {
    hints: false
  },
  // devtool: '#eval-source-map',
  devtool: '#source-map',
  plugins : [
      new AssetsPlugin({
          filename : 'assets.json',
          path : path.join(__dirname,'./dist'),
          update : false
      }),
      //提取框架库
      new webpack.optimize.CommonsChunkPlugin({
          name : 'vendor',
          minChunks: Infinity
      }),
      //提取webpack环境声明的方法
      new webpack.optimize.CommonsChunkPlugin({
          name: 'manifest',
          chunks: ['vendor']
      })
  ]
}

if (isProduction) {
  console.log('delete dist');
  rimraf.sync(path.resolve(__dirname, './dist/*'));
  console.log('delete complete');

  config.devtool = '';
  // http://vue-loader.vuejs.org/en/workflow/production.html
  config.plugins = (config.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    }),
    new ExtractTextPlugin('css/[name].[contenthash].css'),
    //压缩提取出的css
    new OptimizeCSSPlugin({
      cssProcessorOptions: {
          safe: true
      }
    }),
  ])
}

var files = glob.sync('./src/main/*.js');

files.forEach(function(f){
    var name = /.*\/src\/main\/(.*)\.js/.exec(f)[1];

    config.entry[name] = f;
});

module.exports = config;
