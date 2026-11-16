"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore, type RootState } from "./makeStore";
import { pendingActionRestored } from "./slices/pendingAction";
import { readStoredPendingAction, writeStoredPendingAction } from "./slices/pendingAction.storage";

/**
 * Creates one store per mount (the Redux App Router pattern) and keeps the
 * pending action in sessionStorage so it survives the Google sign-in redirect.
 */
export function StoreProvider({
  children,
  preloadedState,
}: {
  children: ReactNode;
  preloadedState?: Partial<RootState>;
}) {
  const [store] = useState<AppStore>(() => makeStore(preloadedState));

  useEffect(() => {
    const storage = window.sessionStorage;
    const stored = readStoredPendingAction(storage, Date.now());
    if (stored) store.dispatch(pendingActionRestored(stored));

    let last = store.getState().pendingAction.action;
    return store.subscribe(() => {
      const current = store.getState().pendingAction.action;
      if (current !== last) {
        last = current;
        writeStoredPendingAction(storage, current);
      }
    });
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
