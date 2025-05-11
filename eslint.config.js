import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
	{
		files: ['src/**/*.{ts,tsx}'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: 2021,
				sourceType: 'module'
			},
			globals: {
				NodeJS: true,
				node: true
			}
		},
		plugins: {
			'@typescript-eslint': typescriptEslint,
			prettier
		},
		rules: {
			...js.configs.recommended.rules,
			...typescriptEslint.configs.recommended.rules,
			...prettierConfig.rules,
			indent: ['error', tab],
			'linebreak-style': ['error', 'unix'],
			quotes: ['error', 'single'],
			semi: ['error', 'always'],
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': 'allow-with-description' }],
			'prettier/prettier': [
				'error',
				{
					endOfLine: 'auto',
					printWidth: 180
				}
			]
		},
		settings: {
			'import/resolver': {
				node: {
					extensions: ['.js', '.ts']
				}
			}
		}
	}
];
