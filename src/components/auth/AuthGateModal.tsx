"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectPendingAction } from "@/store/slices/pendingAction";
import { modalClosed, selectOpenModal } from "@/store/slices/ui";
import { GoogleButton } from "./GoogleButton";
import { OrDivider } from "./OrDivider";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";

/**
 * Sign in or create an account without leaving the tool page. Opened by
 * `useAuthGate`. On success the AuthListener closes it and the tool's
 * <ResumePendingAction> replays what the teacher was doing.
 */
export function AuthGateModal() {
  const open = useAppSelector(selectOpenModal) === "authGate";
  const pending = useAppSelector(selectPendingAction);
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState<"sign-up" | "sign-in">("sign-up");
  const next = pending?.path ?? pathname;
  const close = () => dispatch(modalClosed("authGate"));

  return (
    <Dialog open={open} onOpenChange={(isOpen) => (isOpen ? undefined : close())}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign in to continue</DialogTitle>
          <DialogDescription>
            It&apos;s free to start. What you typed is kept, and we&apos;ll carry on as soon as
            you&apos;re signed in.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <GoogleButton next={next} />
          <OrDivider />
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sign-up">Create account</TabsTrigger>
              <TabsTrigger value="sign-in">Sign in</TabsTrigger>
            </TabsList>
            <TabsContent value="sign-up" className="pt-3">
              <SignUpForm next={next} onSuccess={close} />
            </TabsContent>
            <TabsContent value="sign-in" className="pt-3">
              <SignInForm next={next} onSuccess={close} />
              <p className="mt-3 text-center text-sm">
                <Link
                  href="/forgot-password"
                  className="text-primary underline underline-offset-2"
                  onClick={close}
                >
                  Forgot your password?
                </Link>
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
