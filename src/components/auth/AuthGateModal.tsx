"use client";

import dynamic from "next/dynamic";
import { useAppSelector } from "@/store/hooks";
import { selectOpenModal } from "@/store/slices/ui";

// The dialog brings Formik, Zod and the Supabase client; load it only when
// the gate opens, so public pages stay inside the first-load JS budget.
const AuthGateDialog = dynamic(() => import("./AuthGateDialog"), { ssr: false });

/** Mounted once in the root layout; renders the sign-in dialog when `useAuthGate` opens it. */
export function AuthGateModal() {
  const open = useAppSelector(selectOpenModal) === "authGate";
  return open ? <AuthGateDialog /> : null;
}
