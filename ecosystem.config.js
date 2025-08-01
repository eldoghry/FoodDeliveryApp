// ecosystem.config.js
module.exports = {
	apps: [
		{
			name: 'food-delivery',
			script: 'dist/src/server.js',
			instances: 3,
			// exec_mode: 'fork', // use "cluster" for multi-core
			exec_mode: 'cluster', // use "cluster" for multi-core
			instance_var: 'INSTANCE_ID',
			watch: false,
			env: {
				NODE_ENV: 'production'
			}
		}
	]
};
