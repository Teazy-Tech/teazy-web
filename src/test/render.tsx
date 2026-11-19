import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore, type RootState } from "@/store/makeStore";

/** Renders inside a fresh Redux store; returns the store so tests can assert on it. */
export function renderWithStore(
  ui: ReactElement,
  { preloadedState, ...options }: { preloadedState?: Partial<RootState> } & RenderOptions = {},
): ReturnType<typeof render> & { store: AppStore } {
  const store = makeStore(preloadedState);
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return { store, ...render(ui, { wrapper: Wrapper, ...options }) };
}
