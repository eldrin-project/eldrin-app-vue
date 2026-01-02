/**
 * Types for @eldrin-project/app-vue
 */

import type { App, Component } from 'vue';
import type { MigrationFile, MigrationResult } from '@eldrin-project/eldrin-app-core';

/**
 * Global Eldrin context exposed by the shell
 */
export interface EldrinGlobal {
  getAuthHeaders?: () => Record<string, string>;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

/**
 * Props passed by single-spa during lifecycle
 */
export interface LifecycleProps {
  name: string;
  singleSpa: unknown;
  mountParcel: unknown;
  db?: D1Database;
  manifest?: {
    baseUrl?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Options for creating an Eldrin Vue app
 */
export interface CreateAppOptions {
  /** App name (must match single-spa registration) */
  name: string;
  /** Root Vue component */
  root: Component;
  /** Migration files to run on bootstrap */
  migrations?: MigrationFile[];
  /** Called when migrations complete successfully */
  onMigrationsComplete?: (result: MigrationResult) => void;
  /** Called when migrations fail */
  onMigrationError?: (error: Error) => void;
  /** Vue app configuration callback */
  configureApp?: (app: App) => void;
}

/**
 * Single-spa lifecycle functions
 */
export interface AppLifecycle {
  bootstrap: (props: LifecycleProps) => Promise<void>;
  mount: (props: LifecycleProps) => Promise<void>;
  unmount: (props: LifecycleProps) => Promise<void>;
}

/**
 * Internal app state
 */
export interface AppState {
  db: D1Database | null;
  migrationsComplete: boolean;
  migrationResult: MigrationResult | null;
  vueApp: App | null;
}

/**
 * Database context for composables
 */
export interface DatabaseContext {
  db: D1Database | null;
  migrationsComplete: boolean;
  migrationResult: MigrationResult | null;
}
