# @eldrin-project/eldrin-app-vue

Vue adapter for Eldrin apps providing single-spa lifecycle and database composables.

## Installation

```bash
npm install @eldrin-project/eldrin-app-vue
```

## Usage

```ts
import { createApp } from '@eldrin-project/eldrin-app-vue';
import App from './App.vue';
import migrations from 'virtual:eldrin/migrations';

export const { bootstrap, mount, unmount } = createApp({
  name: 'my-vue-app',
  root: App,
  migrations,
});
```

## Exports

- `createApp(options)` - Factory returning single-spa lifecycle
- `useDatabase()` - Composable for D1 database access
- `useDatabaseContext()` - Composable for full database context
- `useMigrationsComplete()` - Composable for migration status
- `useAuthHeaders()` - Composable for auth headers
