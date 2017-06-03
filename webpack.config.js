var webpack = require("webpack");
var path = require("path");
var autoprefixer = require("autoprefixer");

module.exports = {
  context: __dirname,
  entry: {
    "application": "./assets/application.js",
    "application_server": "./assets/application_server.js"
  },
  output: {
    path: path.join(__dirname, "public/assets/js"),
    publicPath: "/assets/js/",
    filename: "[name].js",
    chunkFilename: "[hash]/js/[id].js",
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['es2015'],
              plugins: ['transform-runtime']
            }
          }
        ],
      },
      {
        test: /\.styl?$/,
        exclude: /main\.styl?$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'postcss-loader'
          },
          {
            loader: 'stylus-loader'
          }
        ]
      },
      {
        test: /\.html/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['es2015'],
              plugins: ['transform-runtime']
            }
          },
          {
            loader: 'template-string-loader'
          }
        ],
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'icons-loader'
          }
        ],
      },
      {
        test: /\.font\.(js|json)$/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader"
          },
          {
            loader: "fontgen-loader"
          }
        ]
      }
    ],
  },
  resolve: {
    modules: ["node_modules", "assets"],
    alias: {
      "router": "ascesis/router"
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      'fetch': 'imports-loader?this=>global!exports-loader?global.fetch!whatwg-fetch'
    }),
  ].concat(process.env['NODE_ENV'] === 'production'
           ? new webpack.optimize.UglifyJsPlugin({
              compress: {
                warnings: false
              }
             })
           : []
  ),
};
