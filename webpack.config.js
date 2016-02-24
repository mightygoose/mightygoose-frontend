var webpack = require("webpack");
var path = require("path");
module.exports = {
	context: __dirname,
	entry: "./assets/application.js",
	output: {
		path: path.join(__dirname, "public/assets/js"),
		publicPath: "assets/js", // relative path for github pages
		filename: "application.js", // no hash in main.js because index.html is a static page
		chunkFilename: "[hash]/js/[id].js",
	},
	module: {
		loaders: [
			//{ test: /\.svg$/,    loader: "file-loader?prefix=font/" },
                  {
                    test: /\.js?$/,
                    exclude: /(node_modules|bower_components)/,
                    loader: 'babel',
                    query: {
                      presets: ['es2015'],
                      plugins: ['transform-runtime']
                    }
                  }
		],
	},
	resolve: {
          modulesDirectories: ["node_modules", "assets"]
	},
	plugins: [
          new webpack.ProvidePlugin({
            'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
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
