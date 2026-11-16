"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/** What a field tells its form about itself, so the form can describe it. */
export interface FieldRegistration {
  label: string;
  required: boolean;
}

interface FormKitContextValue {
  fields: ReadonlyMap<string, FieldRegistration>;
  register: (name: string, registration: FieldRegistration) => () => void;
  /** Prefix that keeps element ids unique when a page has more than one form. */
  idPrefix: string;
}

const FormKitContext = createContext<FormKitContextValue | null>(null);

export function FormKitProvider({ idPrefix, children }: { idPrefix: string; children: ReactNode }) {
  const [fields, setFields] = useState<ReadonlyMap<string, FieldRegistration>>(() => new Map());

  const register = useCallback((name: string, registration: FieldRegistration) => {
    setFields((prev) => new Map(prev).set(name, registration));
    return () =>
      setFields((prev) => {
        const next = new Map(prev);
        next.delete(name);
        return next;
      });
  }, []);

  const value = useMemo(() => ({ fields, register, idPrefix }), [fields, register, idPrefix]);
  return <FormKitContext.Provider value={value}>{children}</FormKitContext.Provider>;
}

export function useFormKit(): FormKitContextValue {
  const ctx = useContext(FormKitContext);
  if (!ctx) throw new Error("Form kit fields must be rendered inside <Form>.");
  return ctx;
}

/** Registers a field with the surrounding <Form> for as long as it is mounted. */
export function useRegisterField(name: string, label: string, required: boolean) {
  const { register } = useFormKit();
  useEffect(() => register(name, { label, required }), [register, name, label, required]);
}

/** Stable, valid HTML id for a field name such as `items.0.title`. */
export function fieldId(idPrefix: string, name: string): string {
  return `${idPrefix}-${name.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}
