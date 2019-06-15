const path = require("path")
const webpack = require("webpack")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const CopyWebpackPlugin = require("copy-webpack-plugin")

module.exports = {
	target: "electron-main",

	entry: path.join(__dirname, "..", "..", "main.js"),

	output: {
		path: path.join(__dirname, "..", "..", "app", "build"),
		filename: "main.js"
	},

	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: "babel-loader"
			},
			{
				test: /\.(png|jpg|gif)$/,
				use: "url-loader"
			}
		]
	},

	resolve: {
		alias: {
			"@": path.join(__dirname, "..", "..", "app", "src")
		}
	},

	plugins: [
		new CleanWebpackPlugin(),

		new webpack.NamedModulesPlugin(),

		new CopyWebpackPlugin([
			{ from: path.join(__dirname, "..", "..", "app", "src", "assets", "icon.png"), to: path.join(__dirname, "..", "..", "app", "build") },
			{ from: path.join(__dirname, "..", "..", "config.json"), to: path.join(__dirname, "..", "..", "app", "build") }
		])
	],

	node: {
		__dirname: false,
		__filename: false
	}
}