module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation changes
        'style', // Formatting, white-space, etc
        'refactor', // Code refactoring
        'test', // Adding/updating tests
        'chore', // Maintenance
        'perf', // Performance improvements
        'ci', // CI/CD changes
        'build', // Build system changes
        'revert', // Revert commits
      ],
    ],
    'subject-case': [2, 'always', ['sentence-case', 'lower-case']],
    'subject-max-length': [2, 'always', 72],
    'header-max-length': [2, 'always', 100],
  },
};

/*
acceptable example 

feat(auth): add JWT authentication
feat: Add JWT authentication
fix(api): resolve user endpoint 404 error
docs(readme): update installation instructions
*/
