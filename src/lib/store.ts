import { useSyncExternalStore } from "react";

export type Store<T> = {
  get: () => T;
  set: (next: T) => void;
  subscribe: (listener: () => void) => () => void;
};

/**
 * A value that lives outside React, which components read and follow. The first value is
 * computed on first use, so it can come from the browser (`localStorage`).
 */
export function createStore<T>(initial: () => T): Store<T> {
  let state: { value: T } | null = null;
  const listeners = new Set<() => void>();

  return {
    get: () => (state ??= { value: initial() }).value,
    set(next) {
      state = { value: next };
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export const useStore = <T>(store: Store<T>) =>
  useSyncExternalStore(store.subscribe, store.get, store.get);
