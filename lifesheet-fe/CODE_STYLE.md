# Code Style Guide

This project uses ESLint and Prettier to maintain consistent code style and quality.

## Available Scripts

In the project directory, you can run:

### `yarn format`

Formats all the code in the `src` directory using Prettier.

### `yarn format:check`

Checks if all files are properly formatted according to Prettier rules without modifying them.

### `yarn lint`

Runs ESLint to check for code quality issues and style problems.

### `yarn lint:fix`

Runs ESLint and automatically fixes issues that can be resolved automatically.

## VS Code Integration

If you're using VS Code, we've included settings to automatically format your code on save. Just make sure you have the following extensions installed:

- ESLint
- Prettier (optional, as formatting is handled by the TypeScript language service)

## Configuration Files

- `.prettierrc` - Prettier configuration
- `.prettierignore` - Files to be ignored by Prettier
- `eslint.config.js` - ESLint configuration
- `.vscode/settings.json` - VS Code settings for the project

## Code Style Rules

This project follows these code style rules:

- Use 2 spaces for indentation
- Maximum line length of 100 characters
- Single quotes for strings
- Semicolons at the end of statements
- Trailing commas in objects and arrays
- No unused variables
- React hooks dependencies must be properly declared

## Pre-commit Hooks (Optional)

For an even better developer experience, consider adding pre-commit hooks using husky and lint-staged to automatically format and lint your code before each commit. This ensures that all committed code follows the project's style guidelines.

To add pre-commit hooks:

```bash
yarn add --dev husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

Then add to your package.json:

```json
"lint-staged": {
  "*.{js,jsx,ts,tsx}": [
    "prettier --write",
    "eslint --fix"
  ],
  "*.{json,css,md}": [
    "prettier --write"
  ]
}
```
