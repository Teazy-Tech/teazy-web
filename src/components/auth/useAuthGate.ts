"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useAppDispatch, useAppStore } from "@/store/hooks";
import { pendingActionSaved, type GateFeature } from "@/store/slices/pendingAction";
import { selectIsSignedIn } from "@/store/slices/session";
import { modalOpened } from "@/store/slices/ui";
import { toPendingValues } from "./pendingValues";

/**
 * Gate an action behind sign-in without leaving the page.
 *
 *   const { requireAuth } = useAuthGate();
 *   onSubmit={(values) => {
 *     if (!requireAuth({ feature: "lesson", values, autoSubmit: true })) return;
 *     ...generate
 *   }}
 *
 * Signed in: returns true. Signed out: saves the action (with the typed
 * values) to `pendingAction`, opens the auth-gate modal and returns false.
 * Put <ResumePendingAction feature="lesson" /> inside the form to replay it.
 */
export function useAuthGate() {
  const store = useAppStore();
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const requireAuth = useCallback(
    (opts: { feature: GateFeature; values?: Record<string, unknown>; autoSubmit?: boolean }) => {
      if (selectIsSignedIn(store.getState())) return true;
      const query = searchParams.toString();
      dispatch(
        pendingActionSaved({
          feature: opts.feature,
          path: query ? `${pathname}?${query}` : pathname,
          values: toPendingValues(opts.values ?? {}),
          autoSubmit: opts.autoSubmit ?? false,
        }),
      );
      dispatch(modalOpened("authGate"));
      return false;
    },
    [store, dispatch, pathname, searchParams],
  );

  return { requireAuth };
}
