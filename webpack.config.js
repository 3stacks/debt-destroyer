const webpack = require('webpack');
const pkg     = require('./package.json');
const Path = require('path');

module.exports = {

	entry: {
		'app': Path.resolve('./src/js/index.js'),
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
		path: Path.resolve('./dist'),
		filename: 'bundle.js'
	},
	resolve: {
		alias: {
			'vue$': 'vue/dist/vue.esm.js'
		}
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