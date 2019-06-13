const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
	mode: 'production', // "production" | "development" | "none"
	watch: false,
	target: 'electron-renderer',
	entry: './src/entry.js',
	output: {
		path: __dirname + '/dist/build',
		publicPath: 'build/',
		filename: 'bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.vue$/,
				use: 'vue-loader'
			},
			{
				test: /\.(png|jpg|gif|svg)$/,
				use: 'file-loader',
			},
			{
				test: /\.css$/,
				use: [
					'style-loader',
					'css-loader'
				]
			},
			{
				test: /\.scss/,
				use: [
					'style-loader',
					'css-loader',
					'sass-loader'
				]
			}
		]
	},
	plugins: [
		new VueLoaderPlugin()
	]
}