# Coding Guidelines: TODO App

## General Principles

Code in this project should be readable, consistent, and easy to maintain. Favour clarity over cleverness. If a piece of logic is not immediately obvious, it warrants a brief comment — but well-named variables and functions are always preferred over comments that compensate for unclear code.

Follow the **DRY (Don't Repeat Yourself)** principle: if the same logic appears more than once, extract it into a shared function or module. Equally, avoid premature abstraction — only generalise when duplication is clearly established.

## Formatting

- Use **2 spaces** for indentation (no tabs)
- Maximum line length is **100 characters**
- Use **single quotes** for strings in JavaScript; template literals where interpolation is needed
- Always include a **trailing newline** at the end of every file
- Remove trailing whitespace

Formatting is enforced automatically — do not fight the formatter.

## Linting

- **ESLint** is the required linter for all JavaScript/JSX code
- All code must pass ESLint checks with zero errors before merging
- Warnings should be treated as errors in CI
- Do not use `eslint-disable` comments unless absolutely necessary, and always include a justification comment explaining why

## Import Organisation

Organise imports in the following order, with a blank line between each group:

1. Node built-in modules (e.g., `path`, `fs`)
2. Third-party packages (e.g., `express`, `react`, `@mui/material`)
3. Internal project modules (relative imports, e.g., `../utils/helpers`)

Within each group, sort imports alphabetically. Named imports should be sorted alphabetically within the braces.

```js
// 1. Node built-ins
import path from 'path';

// 2. Third-party
import express from 'express';
import { Button, Stack } from '@mui/material';
import React, { useState } from 'react';

// 3. Internal
import { formatDate } from '../utils/date';
import TodoItem from './TodoItem';
```

## Naming Conventions

- **Variables and functions**: `camelCase`
- **React components**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE` for true module-level constants; `camelCase` is acceptable for local constants
- **Files**: `camelCase` for utilities and modules; `PascalCase` for React component files (e.g., `TodoItem.js`)
- Names should be descriptive and unambiguous — avoid single-letter names outside of short loop iterators

## Functions

- Prefer small, single-purpose functions
- Arrow functions are preferred for callbacks and one-liners; named `function` declarations are preferred for top-level functions
- Avoid functions longer than ~30 lines — if a function is growing large, consider splitting it

## Error Handling

- Always handle promise rejections and async errors explicitly
- Use `try/catch` in async functions rather than `.catch()` chains where possible
- Never silently swallow errors — at minimum, log them

## React-Specific Guidelines

- Use functional components with hooks; do not use class components
- Keep components focused — a component should do one thing well
- Lift state up only as far as necessary
- Avoid inline styles; use MUI's `sx` prop or a theme instead
- Prop types should be documented with `PropTypes` or TypeScript types

## Backend-Specific Guidelines

- Keep route handlers thin — business logic belongs in separate service or utility modules, not inline in Express routes
- Validate all incoming request data at the route boundary before passing it deeper into the application
- Use `async`/`await` consistently; avoid mixing with raw `.then()` chains

## Version Control Hygiene

- Commits should be small and focused on a single concern
- Write commit messages in the imperative mood (e.g., "Add due date field to task model")
- Do not commit commented-out code, `console.log` debug statements, or TODO comments that are not tracked as issues
