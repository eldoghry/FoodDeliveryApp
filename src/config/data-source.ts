import { DataSource } from 'typeorm';
import { config } from './env';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import logger from './logger';
import { initializeTransactionalContext, addTransactionalDataSource, StorageDriver } from 'typeorm-transactional';

//
export const AppDataSource = new DataSource({
	type: 'postgres',
	host: config.database.host, // Replace with your DB host
	port: config.database.port, // Default PostgreSQL port
	username: config.database.username, // Replace with your DB username
	password: config.database.password, // Replace with your DB password
	database: config.database.name, // Replace with your DB name
	synchronize: config.database.synchronize, // Auto-create tables (set to false in production)
	logging: config.database.logging, // Enable logging for debugging (optional)
	entities: ['src/models/**/*.ts'], // Path to your entity files
	migrations: ['src/migrations/**/*.ts'], // Path to migration files
	subscribers: ['src/subscribers/**/*.ts'], // Path to subscriber files
	poolSize: 20, // Connection pool size (adjust based on your needs)
	extra: {
		connectionTimeoutMillis: 5000, // Timeout for acquiring a connection
		idleTimeoutMillis: 30000 // Time before an idle connection is closed
	},
	namingStrategy: new SnakeNamingStrategy()
});

initializeTransactionalContext({ storageDriver: StorageDriver.ASYNC_LOCAL_STORAGE });
addTransactionalDataSource(AppDataSource);

export const initiateDataSource = async () => {
	// start database connection
	try {
		await AppDataSource.initialize();
		logger.info('Database connected successfully');
	} catch (error) {
		logger.error('Error connecting to the database:', error);
	}
};
