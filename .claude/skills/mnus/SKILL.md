```markdown
# mnus Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the `mnus` JavaScript repository. It covers file naming, import/export styles, commit practices, and testing patterns. This guide is intended to help contributors write consistent code and follow established workflows within the codebase.

## Coding Conventions

### File Naming
- **Style:** kebab-case
- **Example:**  
  ```
  user-profile.js
  utils/helpers.js
  ```

### Import Style
- **Relative imports** are used throughout the codebase.
- **Example:**
  ```javascript
  import { fetchData } from './utils/fetch-data.js';
  ```

### Export Style
- **Named exports** are preferred.
- **Example:**
  ```javascript
  // In utils/math-helpers.js
  export function add(a, b) {
    return a + b;
  }

  export function subtract(a, b) {
    return a - b;
  }
  ```

  ```javascript
  // In another file
  import { add, subtract } from './utils/math-helpers.js';
  ```

### Commit Patterns
- **Type:** Freeform (no enforced prefix)
- **Average length:** ~46 characters
- **Example:**
  ```
  Fix bug in user authentication flow
  Add helper for date formatting
  ```

## Workflows

### Adding a New Module
**Trigger:** When you need to add a new feature or utility module.
**Command:** `/add-module`

1. Create a new file using kebab-case naming (e.g., `feature-name.js`).
2. Write your code using named exports.
3. Use relative imports to include dependencies.
4. Add or update relevant tests in a corresponding `*.test.*` file.
5. Commit your changes with a descriptive message.

### Writing Tests
**Trigger:** When adding or updating functionality that requires testing.
**Command:** `/write-test`

1. Create a test file matching the pattern `*.test.*` (e.g., `feature-name.test.js`).
2. Write your tests using the project's preferred (unknown) testing framework.
3. Ensure all tests pass before committing.

### Importing and Exporting Functions
**Trigger:** When sharing code between modules.
**Command:** `/share-function`

1. Use named exports in your source file.
2. Use relative imports to bring functions into other files.

## Testing Patterns

- **Test File Pattern:** Files follow the `*.test.*` naming convention (e.g., `math-helpers.test.js`).
- **Testing Framework:** Not explicitly detected; follow existing patterns in the codebase.
- **Example:**
  ```javascript
  // math-helpers.test.js
  import { add } from './math-helpers.js';

  test('add returns correct sum', () => {
    expect(add(2, 3)).toBe(5);
  });
  ```

## Commands
| Command        | Purpose                                      |
|----------------|----------------------------------------------|
| /add-module    | Scaffold a new module with proper conventions|
| /write-test    | Create and structure a new test file         |
| /share-function| Import/export functions between modules      |
```
