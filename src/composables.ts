/**
 * Vue composables for Eldrin apps
 */

import { inject, type InjectionKey } from 'vue';
import type { DatabaseContext, EldrinGlobal } from './types';

/**
 * Injection key for database context
 */
export const DatabaseContextKey: InjectionKey<DatabaseContext> = Symbol('eldrin-database');

/**
 * Get the D1 database instance
 * @returns The database instance or null if not available
 */
export function useDatabase(): D1Database | null {
  const context = inject(DatabaseContextKey);
  if (!context) {
    console.warn('useDatabase() called outside of Eldrin app context');
    return null;
  }
  return context.db;
}

/**
 * Get the full database context including migration status
 * @returns Database context with db, migrationsComplete, and migrationResult
 */
export function useDatabaseContext(): DatabaseContext {
  const context = inject(DatabaseContextKey);
  if (!context) {
    console.warn('useDatabaseContext() called outside of Eldrin app context');
    return {
      db: null,
      migrationsComplete: false,
      migrationResult: null,
    };
  }
  return context;
}

/**
 * Check if migrations have completed
 * @returns True if migrations have completed successfully
 */
export function useMigrationsComplete(): boolean {
  const context = inject(DatabaseContextKey);
  return context?.migrationsComplete ?? false;
}

/**
 * Get the global Eldrin context from the shell
 *
 * Non-reactive helper function for use outside Vue components.
 *
 * @returns The Eldrin global context or null if not available
 */
export function getEldrinGlobal(): EldrinGlobal | null {
  const win = window as unknown as { __ELDRIN__?: EldrinGlobal };
  return win.__ELDRIN__ ?? null;
}

/**
 * Get the global Eldrin context from the shell (composable)
 * @returns The Eldrin global context or null if not available
 */
export function useEldrinGlobal(): EldrinGlobal | null {
  return getEldrinGlobal();
}

/**
 * Get auth headers from the shell
 * @returns Record of auth headers to include in API requests
 */
export function useAuthHeaders(): Record<string, string> {
  const eldrin = useEldrinGlobal();
  return eldrin?.getAuthHeaders?.() ?? {};
}
