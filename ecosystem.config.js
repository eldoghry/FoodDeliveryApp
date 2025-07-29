// ecosystem.config.js
module.exports = {
	apps: [
		{
			name: 'food-delivery',
			script: 'dist/src/server.js',
			instances: 1,
			exec_mode: 'fork', // use "cluster" for multi-core
			watch: false,
			env: {
				NODE_ENV: 'production'
			}
		}
	]
};
