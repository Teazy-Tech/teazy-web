"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { signedIn, signedOut } from "@/store/slices/session";
import { modalClosed } from "@/store/slices/ui";
import { authClient } from "./supabase";

/**
 * Keeps the `session` slice in step with Supabase Auth (sign-in, sign-out,
 * token refresh, other tabs). Mounted once in the root layout. Closes the
 * auth-gate modal as soon as the teacher is signed in.
 */
export function AuthListener() {
  const dispatch = useAppDispatch();

  useEffect(() => {
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
    return () => data.subscription.unsubscribe();
  }, [dispatch]);

  return null;
}
