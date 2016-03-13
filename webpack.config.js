var webpack = require("webpack");
var path = require("path");
var autoprefixer = require("autoprefixer");
var IconFontPlugin = require("icons-loader/IconsPlugin");

module.exports = {
	context: __dirname,
	entry: "./assets/application.js",
	output: {
          path: path.join(__dirname, "public/assets/js"),
          publicPath: "/assets/js/", // relative path for github pages
          filename: "application.js", // no hash in main.js because index.html is a static page
          chunkFilename: "[hash]/js/[id].js",
	},
	module: {
          loaders: [
            {
              test: /\.js?$/,
              exclude: /(node_modules|bower_components)/,
              loader: 'babel',
              query: {
                presets: ['es2015'],
                plugins: ['transform-runtime']
              }
            },
            {
              test: /\.styl?$/,
              exclude: /main\.styl?$/,
              loader: 'style!css!postcss-loader!stylus'
            },
            {
              test: /\.svg$/,
              loader: "icons-loader",
            }
          ],
	},
        postcss: function () {
          return [autoprefixer];
        },
	resolve: {
          modulesDirectories: ["node_modules", "assets"]
	},
	plugins: [
          new webpack.ProvidePlugin({
            'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
          }),
          new IconFontPlugin({
            fontName: 'MightyIcons',
            className: 'mg',
            //timestamp: RUN_TIMESTAMP,
            normalize: true,
            formats: ['ttf', 'eot', 'woff', 'svg']
          }),
          //new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 20 })
	].concat(process.env['NODE_ENV'] === 'production'
                 ? new webpack.optimize.UglifyJsPlugin({
                     compress: {
                       warnings: false
                     }
                   })
                 : []),
	fakeUpdateVersion: 0
};
