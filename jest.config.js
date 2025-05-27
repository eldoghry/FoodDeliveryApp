/** @type {import('jest').Config} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/src', '<rootDir>/tests'],
	testMatch: [
		'**/*.test.ts', // Matches unit tests
		'**/*.spec.ts', // Alternative pattern
		'**/e2e/**/*.e2e.test.ts' // E2E tests in tests/e2e/
	],
	moduleFileExtensions: ['ts', 'js', 'json'],
	transform: {
		'^.+\\.ts$': 'ts-jest'
	},
	coverageDirectory: 'coverage',
	collectCoverageFrom: [
		'src/**/*.{ts,js}',
		'!src/main.ts',
		'!src/**/*.interface.ts',
		'!src/**/*.dto.ts',
		'!src/**/__tests__/**'
	],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1' // Optional: if you're using path aliases
	},
	setupFiles: ['<rootDir>/jest.env-setup.js'] // Loads your .env file for tests
};
