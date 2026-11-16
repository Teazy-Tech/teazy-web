"use client";

import { useFormikContext, type FormikValues } from "formik";
import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  pendingActionCleared,
  selectPendingAction,
  type GateFeature,
} from "@/store/slices/pendingAction";
import { selectIsSignedIn } from "@/store/slices/session";

/**
 * Replays an action that was interrupted by sign-in. Render it inside the
 * tool's <Form>. Once the teacher is signed in and a pending action exists for
 * `feature`, it restores the typed values, re-submits if the action asked
 * for it, and clears the pending action so it runs only once.
 */
export function ResumePendingAction({ feature }: { feature: GateFeature }) {
  const pending = useAppSelector(selectPendingAction);
  const signedIn = useAppSelector(selectIsSignedIn);
  const dispatch = useAppDispatch();
  const { values, setValues, submitForm } = useFormikContext<FormikValues>();
  const handled = useRef(false);

  useEffect(() => {
    if (!pending) handled.current = false; // allow a later gate on the same page
    if (handled.current || !signedIn || !pending || pending.feature !== feature) return;
    handled.current = true;
    dispatch(pendingActionCleared());
    void (async () => {
      await setValues({ ...values, ...pending.values }, true);
      if (pending.autoSubmit) await submitForm();
    })();
  }, [signedIn, pending, feature, dispatch, setValues, submitForm, values]);

  return null;
}
