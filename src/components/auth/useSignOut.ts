"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import { authErrorMessage } from "@/lib/auth/errors";
import { useAppDispatch } from "@/store/hooks";
import { signedOut } from "@/store/slices/session";

/**
 * Signs the teacher out and goes home. The `session` slice is cleared here
 * as well as by AuthListener, so personal links disappear immediately.
 */
export function useSignOut() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  return useCallback(async () => {
    // Loaded on click so the header doesn't ship the Supabase client.
    const { authClient } = await import("./supabase");
    const supabase = authClient();
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(authErrorMessage(error));
        return;
      }
    }
    dispatch(signedOut());
    router.replace("/");
    router.refresh();
  }, [dispatch, router]);
}
