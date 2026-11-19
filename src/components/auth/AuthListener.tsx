"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { signedIn, signedOut } from "@/store/slices/session";
import { modalClosed } from "@/store/slices/ui";

/**
 * Keeps the `session` slice in step with Supabase Auth (sign-in, sign-out,
 * token refresh, other tabs). Mounted once in the root layout. Closes the
 * auth-gate modal as soon as the teacher is signed in.
 *
 * The Supabase client is imported after first paint, so it is not part of
 * every page's first-load JavaScript.
 */
export function AuthListener() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    void import("./supabase").then(({ authClient }) => {
      if (cancelled) return;
      const supabase = authClient();
      if (!supabase) {
        dispatch(signedOut());
        return;
      }
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          dispatch(signedIn({ id: session.user.id, email: session.user.email ?? null }));
          dispatch(modalClosed("authGate"));
        } else {
          dispatch(signedOut());
        }
      });
      unsubscribe = () => data.subscription.unsubscribe();
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [dispatch]);

  return null;
}
