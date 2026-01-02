/**
 * Vue single-spa lifecycle factory for Eldrin apps
 */

import { createApp as createVueApp, h, reactive } from 'vue';
import singleSpaVue from 'single-spa-vue';
import { runMigrations } from '@eldrin-project/eldrin-app-core';
import { DatabaseContextKey } from './composables';
import type {
  CreateAppOptions,
  AppLifecycle,
  AppState,
  LifecycleProps,
  DatabaseContext,
} from './types';

/**
 * Creates a single-spa compatible Vue app with Eldrin integration
 *
 * @example
 * ```ts
 * import { createApp } from '@eldrin-project/app-vue';
 * import App from './App.vue';
 * import migrations from 'virtual:eldrin/migrations';
 *
 * export const { bootstrap, mount, unmount } = createApp({
 *   name: 'my-vue-app',
 *   root: App,
 *   migrations,
 *   onMigrationsComplete: (result) => {
 *     console.log(`Ran ${result.executed} migrations`);
 *   },
 * });
 * ```
 */
export function createApp(options: CreateAppOptions): AppLifecycle {
  const {
    name,
    root: RootComponent,
    migrations = [],
    onMigrationsComplete,
    onMigrationError,
    configureApp,
  } = options;

  // App state persists across mount/unmount cycles
  const state: AppState = {
    db: null,
    migrationsComplete: false,
    migrationResult: null,
    vueApp: null,
  };

  // Reactive database context for composables
  const databaseContext = reactive<DatabaseContext>({
    db: null,
    migrationsComplete: false,
    migrationResult: null,
  });

  /**
   * Bootstrap - runs once when app is first loaded
   * Runs migrations before the app mounts
   */
  async function bootstrap(props: LifecycleProps): Promise<void> {
    const db = props.db;

    if (!db) {
      console.warn(`[${name}] No database provided in lifecycle props`);
      state.migrationsComplete = true;
      databaseContext.migrationsComplete = true;
      return;
    }

    state.db = db;
    databaseContext.db = db;

    // Run migrations if provided
    if (migrations.length > 0) {
      try {
        const result = await runMigrations(db, { migrations });
        state.migrationResult = result;
        state.migrationsComplete = result.success;
        databaseContext.migrationResult = result;
        databaseContext.migrationsComplete = result.success;

        if (result.success) {
          onMigrationsComplete?.(result);
        } else if (result.error) {
          const error = new Error(result.error.message);
          onMigrationError?.(error);
        }
      } catch (error) {
        console.error(`[${name}] Migration failed:`, error);
        state.migrationsComplete = false;
        databaseContext.migrationsComplete = false;
        onMigrationError?.(error instanceof Error ? error : new Error(String(error)));
      }
    } else {
      state.migrationsComplete = true;
      databaseContext.migrationsComplete = true;
    }
  }

  // Create the single-spa-vue lifecycle
  const vueLifecycles = singleSpaVue({
    createApp: createVueApp,
    appOptions: {
      render() {
        return h(RootComponent, {
          db: state.db,
          migrationsComplete: state.migrationsComplete,
          migrationResult: state.migrationResult,
        });
      },
    },
    handleInstance: (app) => {
      // Provide database context for composables
      app.provide(DatabaseContextKey, databaseContext);

      // Allow custom app configuration
      configureApp?.(app);

      state.vueApp = app;
    },
  });

  return {
    bootstrap,
    mount: vueLifecycles.mount,
    unmount: vueLifecycles.unmount,
  };
}
