/**
 * @eldrin-project/eldrin-app-vue
 *
 * Vue adapter for Eldrin apps providing:
 * - createApp() factory for single-spa lifecycle with migration support
 * - combineLifecycles() for advanced lifecycle composition
 * - Vue composables for database access and auth
 *
 * @example
 * ```ts
 * // eldrin-my-app.ts (single-spa entry point)
 * import { createApp } from '@eldrin-project/eldrin-app-vue';
 * import App from './App.vue';
 * import migrations from 'virtual:eldrin/migrations';
 *
 * export const { bootstrap, mount, unmount } = createApp({
 *   name: 'my-vue-app',
 *   root: App,
 *   migrations,
 * });
 * ```
 *
 * @example
 * ```vue
 * <!-- Component using composables -->
 * <script setup lang="ts">
 * import { useDatabase, useAuthHeaders } from '@eldrin-project/eldrin-app-vue';
 *
 * const db = useDatabase();
 * const authHeaders = useAuthHeaders();
 *
 * async function fetchData() {
 *   const result = await db?.prepare('SELECT * FROM items').all();
 *   // or fetch from API with auth
 *   const response = await fetch('/api/items', { headers: authHeaders });
 * }
 * </script>
 * ```
 */

// Lifecycle factory
export { createApp, combineLifecycles } from './createApp';

// Composables
export {
  useDatabase,
  useDatabaseContext,
  useMigrationsComplete,
  useEldrinGlobal,
  useAuthHeaders,
  getEldrinGlobal,
  DatabaseContextKey,
} from './composables';

// Types
export type {
  CreateAppOptions,
  LifecycleProps,
  LifecycleFn,
  AppLifecycle,
  AppState,
  DatabaseContext,
  EldrinGlobal,
} from './types';

// Re-export migration types from core
export type { MigrationFile, MigrationResult } from '@eldrin-project/eldrin-app-core';
