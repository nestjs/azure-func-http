module.exports = function (options) {
	return {
		...options,
		entry: __dirname + '/main/index.ts',
		output: {
			libraryTarget: 'commonjs2',
			filename: 'apps/<%= project %>/main/index.js'
		},
	};
};