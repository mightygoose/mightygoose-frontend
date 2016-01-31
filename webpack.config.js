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
		],
	},
	resolve: {
                fallback: path.join(__dirname, "assets")
	},
	plugins: [
		new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 20 })
	],
	fakeUpdateVersion: 0
};
