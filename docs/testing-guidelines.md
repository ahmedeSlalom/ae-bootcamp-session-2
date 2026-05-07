# Testing Guidelines: TODO App

## General Principles

- All new features must include appropriate tests
- Tests must be isolated and independent — each test sets up its own data and does not rely on other tests
- Setup and teardown hooks are required; tests must succeed on repeated runs
- Tests should be maintainable and follow best practices

## Unit Tests

- **Framework**: [Jest](https://jestjs.io/)
- Test individual functions and React components in isolation
- Naming convention: `*.test.js` or `*.test.ts`
- Name test files to match what they're testing (e.g., `app.test.js` for `app.js`)
- **Backend** unit tests: `packages/backend/__tests__/`
- **Frontend** unit tests: `packages/frontend/src/__tests__/`

## Integration Tests

- **Framework**: Jest + [Supertest](https://github.com/ladjs/supertest)
- Test backend API endpoints with real HTTP requests
- Naming convention: `*.test.js` or `*.test.ts`
- Location: `packages/backend/__tests__/integration/`
- Name files based on what they test (e.g., `todos-api.test.js` for TODO API endpoints)

## End-to-End (E2E) Tests

- **Framework**: [Playwright](https://playwright.dev/) (required — do not use alternatives)
- Test complete UI workflows through browser automation
- Naming convention: `*.spec.js` or `*.spec.ts`
- Location: `tests/e2e/`
- Name files based on the user journey they test (e.g., `todo-workflow.spec.js`)
- Use **one browser only** in all Playwright tests
- Use the **Page Object Model (POM)** pattern for maintainability
- Limit E2E tests to **5–8 critical user journeys** — focus on happy paths and key edge cases, not exhaustive coverage

## Port Configuration

Always use environment variables with sensible defaults for port configuration to allow CI/CD workflows to dynamically detect ports.

- **Backend**: `const PORT = process.env.PORT || 3030;`
- **Frontend**: React's default port is `3000`, but can be overridden with the `PORT` environment variable
