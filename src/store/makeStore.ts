import { combineSlices, configureStore } from "@reduxjs/toolkit";
import { pendingActionSlice } from "./slices/pendingAction";
import { sessionSlice } from "./slices/session";
import { teachingContextSlice } from "./slices/teachingContext";
import { uiSlice } from "./slices/ui";

/**
 * Root reducer. `baseApi` (RTK Query, WEB-02 week 3) is added here with its
 * middleware once codegen lands. Only the slices listed in README §4 belong here.
 */
const rootReducer = combineSlices(sessionSlice, teachingContextSlice, uiSlice, pendingActionSlice);

export type RootState = ReturnType<typeof rootReducer>;

/**
 * Creates a new store. Called once per request on the server and once per page
 * load in the browser (by `StoreProvider`). Never export a store instance from
 * a module: on the server that would share one teacher's state with another.
 */
export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({ reducer: rootReducer, preloadedState });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
