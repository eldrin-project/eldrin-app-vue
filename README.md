# @eldrin-project/eldrin-app-vue

Vue adapter for building Eldrin marketplace apps with single-spa micro-frontend architecture and Cloudflare D1 database support.

## Overview

This package is the **Vue adapter layer** in the Eldrin ecosystem:

```
┌─────────────────────────────────────────────────────────────┐
│                     Your Vue App                            │
├─────────────────────────────────────────────────────────────┤
│              @eldrin-project/eldrin-app-vue                 │
│  • single-spa lifecycle management                          │
│  • Vue composables for database access                      │
│  • Shell communication (auth, user context)                 │
├─────────────────────────────────────────────────────────────┤
│              @eldrin-project/eldrin-app-core                │
│  • Database migrations with checksum verification           │
│  • Auth utilities (JWT, permissions)                        │
│  • Event communication                                      │
├─────────────────────────────────────────────────────────────┤
│                    Eldrin Shell                             │
│  • Micro-frontend orchestration                             │
│  • User authentication                                      │
│  • D1 database provisioning                                 │
└─────────────────────────────────────────────────────────────┘
```

## Installation

```bash
npm install @eldrin-project/eldrin-app-vue
```

**Peer dependencies:**
- `vue` ^3.4.0 || ^3.5.0

## Quick Start

### 1. Set up single-spa entry point (`eldrin-my-app.ts`)

```ts
import { createApp } from '@eldrin-project/eldrin-app-vue';
import App from './App.vue';
import migrations from './migrations';

export const { bootstrap, mount, unmount } = createApp({
  name: 'my-vue-app',
  root: App,
  migrations,
  onMigrationsComplete: (result) => {
    console.log(`Executed ${result.executed} migrations`);
  },
  configureApp: (app) => {
    // Optional: Add plugins, global components, etc.
    // app.use(router);
    // app.use(pinia);
  },
});
```

### 2. Use composables in components

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  useDatabase,
  useAuthHeaders,
  useEldrinGlobal,
  useMigrationsComplete,
} from '@eldrin-project/eldrin-app-vue';

const db = useDatabase();
const authHeaders = useAuthHeaders();
const eldrin = useEldrinGlobal();
const migrationsComplete = useMigrationsComplete();

const items = ref([]);

onMounted(async () => {
  if (!migrationsComplete) {
    console.log('Waiting for migrations...');
    return;
  }

  // Option 1: Direct D1 query
  if (db) {
    const result = await db.prepare('SELECT * FROM items').all();
    items.value = result.results;
  }

  // Option 2: API call with auth
  const response = await fetch('/api/items', {
    headers: authHeaders,
  });
  items.value = await response.json();
});
</script>

<template>
  <div>
    <p>Welcome, {{ eldrin?.user?.name }}</p>
    <ul>
      <li v-for="item in items" :key="item.id">{{ item.name }}</li>
    </ul>
  </div>
</template>
```

## API Reference

### Lifecycle Functions

#### `createApp(options: CreateAppOptions): AppLifecycle`

Creates a single-spa compatible Vue app with Eldrin integration.

```ts
interface CreateAppOptions {
  name: string;                                      // App name (for logging)
  root: Component;                                   // Root Vue component
  migrations?: MigrationFile[];                      // SQL migrations to run
  onMigrationsComplete?: (result: MigrationResult) => void;
  onMigrationError?: (error: Error) => void;
  configureApp?: (app: App) => void;                 // Vue app configuration
}
```

#### `combineLifecycles(eldrinLifecycle, vueLifecycle): AppLifecycle`

Combines Eldrin lifecycle with another single-spa lifecycle. Useful for advanced scenarios where you need more control.

```ts
import { createApp, combineLifecycles } from '@eldrin-project/eldrin-app-vue';
import singleSpaVue from 'single-spa-vue';

const eldrinLifecycle = createApp({ name: 'my-app', root: App, migrations });
const customLifecycle = singleSpaVue({ /* custom config */ });

export const { bootstrap, mount, unmount } = combineLifecycles(
  eldrinLifecycle,
  customLifecycle
);
```

### Composables

| Composable | Return Type | Description |
|------------|-------------|-------------|
| `useDatabase()` | `D1Database \| null` | Access the D1 database instance |
| `useDatabaseContext()` | `DatabaseContext` | Full context with migration status |
| `useMigrationsComplete()` | `boolean` | Check if migrations completed |
| `useEldrinGlobal()` | `EldrinGlobal \| null` | Access shell context (auth, user) |
| `useAuthHeaders()` | `Record<string, string>` | Get authentication headers for API calls |

### Helper Functions

#### `getEldrinGlobal(): EldrinGlobal | null`

Non-reactive helper for accessing shell context outside Vue components.

```ts
import { getEldrinGlobal } from '@eldrin-project/eldrin-app-vue';

const eldrin = getEldrinGlobal();
const headers = eldrin?.getAuthHeaders?.() ?? {};
```

### Injection Keys

#### `DatabaseContextKey`

Vue injection key for database context. Used internally by composables.

```ts
import { inject } from 'vue';
import { DatabaseContextKey } from '@eldrin-project/eldrin-app-vue';

const context = inject(DatabaseContextKey);
```

### Types

```ts
// Global context exposed by the Eldrin shell
interface EldrinGlobal {
  getAuthHeaders?: () => Record<string, string>;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

// Database context with migration status
interface DatabaseContext {
  db: D1Database | null;
  migrationsComplete: boolean;
  migrationResult: MigrationResult | null;
}

// Single-spa lifecycle props
interface LifecycleProps {
  name: string;
  singleSpa: unknown;
  mountParcel: unknown;
  db?: D1Database;
  manifest?: { baseUrl?: string; [key: string]: unknown };
}
```

## Migration System

Migrations run automatically during the single-spa bootstrap phase, before your Vue app mounts.

```ts
// migrations.ts (auto-generated by Vite plugin)
import type { MigrationFile } from '@eldrin-project/eldrin-app-core';

const migrations: MigrationFile[] = [
  {
    name: '20240101120000-create-items.sql',
    content: 'CREATE TABLE IF NOT EXISTS items (id TEXT PRIMARY KEY, name TEXT);',
  },
];

export default migrations;
```

Migrations are tracked in `_eldrin_migrations` table with SHA-256 checksums.

## Shell Integration

The Eldrin shell provides:

- **Authentication**: Access via `useAuthHeaders()` or `window.__ELDRIN__.getAuthHeaders()`
- **User context**: Current user via `useEldrinGlobal()?.user`
- **Database**: D1 instance passed through single-spa props

## App Configuration

Use `configureApp` to add Vue plugins:

```ts
import { createPinia } from 'pinia';
import { createRouter } from 'vue-router';

export const { bootstrap, mount, unmount } = createApp({
  name: 'my-vue-app',
  root: App,
  configureApp: (app) => {
    app.use(createPinia());
    app.use(createRouter({ /* ... */ }));
  },
});
```

## Related Packages

- [`@eldrin-project/eldrin-app-core`](https://www.npmjs.com/package/@eldrin-project/eldrin-app-core) - Core library
- [`@eldrin-project/eldrin-app-angular`](https://www.npmjs.com/package/@eldrin-project/eldrin-app-angular) - Angular adapter
- [`@eldrin-project/eldrin-app-react`](https://www.npmjs.com/package/@eldrin-project/eldrin-app-react) - React adapter
- [`@eldrin-project/eldrin-app-svelte`](https://www.npmjs.com/package/@eldrin-project/eldrin-app-svelte) - Svelte adapter
- [`create-eldrin-project`](https://www.npmjs.com/package/create-eldrin-project) - Project scaffolding CLI

## License

MIT
