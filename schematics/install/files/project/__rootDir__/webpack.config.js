module.exports = function (options) {
	return {
		...options,
		entry: __dirname + '/src/main/index.ts',
		output: {
			libraryTarget: 'commonjs2',
			filename: '<%= rootDir %>/main/index.js'
		},
	};
};