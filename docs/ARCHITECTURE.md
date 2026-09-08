# Selin V2 Architecture

This document describes the high-level architecture of the Selin V2 system.

## Overview
Selin V2 is a lightweight, backend-only AI agent ecosystem structured as a set of modular services, a core personality engine, an adapter for transport, and a SQLite database.

```
+---------------------------------------------------------------+
|                       src/server.ts                           |
+---------------------------------------------------------------+
                                |
                                v
+---------------------------------------------------------------+
|                    adapters/MaxAdapter.ts                     |
+---------------------------------------------------------------+
                                |
                                v
+---------------------------------------------------------------+
|                      core/SelinCore.ts                        |
+---------------------------------------------------------------+
                                |
         +----------------------+----------------------+
         |                      |                      |
         v                      v                      v
+------------------+   +------------------+   +------------------+
| services/Search  |   | services/Voice   |   | services/Image   |
+------------------+   +------------------+   +------------------+
         |                      |                      |
         +----------------------+----------------------+
                                |
                                v
+---------------------------------------------------------------+
|                 services/ProviderGateway.ts                   |
+---------------------------------------------------------------+
                                |
                                v
+---------------------------------------------------------------+
|                      db/Database.ts                           |
+---------------------------------------------------------------+
```

## Core Components
1. **SelinCore**: The brain of the agent. Manages identity, memory, personality, and context, coordinating external services when requested.
2. **ProviderGateway**: The central gateway wrapping OmniRoute API (compatible with OpenAI format) for chat completions.
3. **ImageGen**: Generates images using the Pollinations.ai API.
4. **Voice**: Generates speech audio using Microsoft Edge TTS.
5. **Search**: Conducts web searches using the Tavily API.
6. **MaxAdapter**: Specialized adapter for the MAX transport layer, handling incoming webhook events and signatures.
7. **Database**: A wrapper over `better-sqlite3` providing structured state storage for Selin V2.
