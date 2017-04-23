module.exports = function(config) {
	config.set({
		files: [
			{ pattern: 'test/unit/**/*', watched: false }
		],
		preprocessors: {
			'test/unit/**/*': ['webpack'],
			// Exclude the tests in the coverage report
			'!**/**/**.test.js': ['coverage']
		},
		webpack: {
			entry: {
				// Wildcard mapping doesn't work for webpack entries
				filename: 'test/unit/**/*'
			},
			resolve: {
				extensions: ['.js', '.jsx']
			},
			module: {
				loaders: [
					{
						test: /\.(js|jsx)$/,
						exclude: /node_modules/,
						loader: 'babel-loader',
						query: {
							"plugins": [
								"istanbul",
								"transform-runtime"
							],
							"presets" : [
								"es2015",
								"es2017"
							]
						}
					}
				]
			},
			node: {
				// Force webpack to replace fs with an empty package
				fs: "empty"
			},
			watch: true
		},
		customLaunchers: {
			chromeTravisCi: {
				base: 'Chrome',
				flags: ['--no-sandbox']
			}
		},
		webpackServer: {
			noInfo: true
		},
		frameworks: ['mocha'],
		reporters: ['mocha', 'coverage'],
		coverageReporter: {
			dir: './coverage',
			reporters: [
				{
					type: 'html'
				},
				{
					type: 'lcov'
				}
			]
		},
		browsers: process.env.TRAVIS ? ['chromeTravisCi'] : ['Chrome'],
		failOnEmptyTestSuite: true,
		singleRun: true
	});
};