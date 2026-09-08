# Selin AI Agent Instructions

Welcome to the Selin AI codebase. As an autonomous or semi-autonomous development agent, you must strictly adhere to the project directives below.

## Core Directives
1. **Strict Line Counts**: 
   - Never write a file exceeding 300 lines of code.
   - Never write a function exceeding 80 lines of code.
2. **Real Integrations Only**:
   - Never implement mockup, fake, or simulated services.
   - Connect directly to public APIs (Pollinations, Tavily, OmniRoute, Edge TTS).
   - Return detailed `{ ok: false, error: "missing_key:<NAME>" }` objects when keys are absent.
3. **Database Consistency**:
   - Utilize `Database.ts` for all database interactions.
   - Ensure the five core tables (`users`, `conversations`, `subscriptions`, `settings`, `logs`) are maintained perfectly.
