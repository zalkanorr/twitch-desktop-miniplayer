const path = require("path")
const webpack = require("webpack")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const VueLoaderPlugin = require("vue-loader/lib/plugin")

module.exports = {
	target: "electron-renderer",

	entry: path.join(__dirname, "..", "..", "app", "src", "entry.js"),

	output: {
		path: path.join(__dirname, "..", "..", "app", "build"),
		filename: "bundle.js"
	},

	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: "babel-loader"
			},
			{
				test: /\.vue$/,
				use: "vue-loader"
			},
			{
				test: /\.s?css$/,
				use: ["vue-style-loader", "style-loader", "css-loader", "sass-loader"]
			},
			{
				test: /\.(png|jpg|gif|svg)$/,
				use: 'file-loader',
			},
		]
	},

	resolve: {
		extensions: [".vue", ".js", ".scss"],
		alias: {
			"@": path.join(__dirname, "..", "..", "..", "src")
		}
	},

	plugins: [
		new VueLoaderPlugin(),

		new webpack.NamedModulesPlugin(),

		new HtmlWebpackPlugin({
			template: path.join(__dirname, "..", "..", "app", "index.html"),
			inject: false
		})
	]
}