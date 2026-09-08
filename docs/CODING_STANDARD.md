# Selin AI Coding Standards

This document defines the coding standards and guidelines for the Selin AI ecosystem.

## 1. Architectural Rules
* **No Mock Data**: All services must be real thin wrappers. If keys or configurations are missing, return `{ ok: false, error: "missing_key:<NAME>" }` and log it.
* **Strict Line Limits**: 
  * Every file must be under **300 lines**.
  * Every function/method must be under **80 lines**.
* **Type Safety**: Strictly use TypeScript. Define proper type interfaces for all inputs, outputs, and database structures.

## 2. Database Constraints
* Always use `Database.ts` which wraps `better-sqlite3`.
* The schema must strictly contain exactly five tables:
  1. `users`
  2. `conversations`
  3. `subscriptions`
  4. `settings`
  5. `logs`

## 3. Formatting and Style
* Use ES modules. All imports must be defined at the top level.
* Keep classes modular and single-responsibility focused.
