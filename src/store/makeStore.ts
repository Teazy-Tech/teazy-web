import { combineSlices, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { baseApi } from "./baseApi";
import { pendingActionSlice } from "./slices/pendingAction";
import { sessionSlice } from "./slices/session";
import { teachingContextSlice } from "./slices/teachingContext";
import { uiSlice } from "./slices/ui";

/**
 * Root reducer: the RTK Query cache (`baseApi`) plus the UI slices listed in
 * README §4. Server data lives only in the `api` cache, never in a slice.
 */
const rootReducer = combineSlices(
  baseApi,
  sessionSlice,
  teachingContextSlice,
  uiSlice,
  pendingActionSlice,
);

export type RootState = ReturnType<typeof rootReducer>;

/**
 * Creates a new store. Called once per request on the server and once per page
 * load in the browser (by `StoreProvider`). Never export a store instance from
 * a module: on the server that would share one teacher's state with another.
 */
export function makeStore(preloadedState?: Partial<RootState>) {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
  });
  // Online/offline events for refetchOnReconnect. Browser only.
  if (typeof window !== "undefined") setupListeners(store.dispatch);
  return store;
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
