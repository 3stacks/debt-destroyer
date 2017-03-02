const webpack = require('webpack');
const pkg     = require('./package.json');
module.exports = {

	entry: {
		'app': './src/js/index.js',
		'vendor': Object.keys(pkg.dependencies)
	},
	plugins: [
		new webpack.optimize.CommonsChunkPlugin({
			name: 'vendor',
			filename: 'vendor.js',
			minChunks: Infinity
		})
	],
	output: {
		path: './dist',
		filename: 'bundle.js'
	},
	module: {
		loaders: [
			{
				test: /\.js?$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				query: {
					plugins: [
						'transform-es2015-modules-commonjs',
						'transform-runtime',
						'transform-object-rest-spread',
					],
					presets: [
						'es2015',
						'es2017'
					]
				}
			}
		]
	}
};