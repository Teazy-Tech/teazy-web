import { describe, expect, it, vi } from "vitest";
import { makeStore } from "../makeStore";
import {
  PENDING_ACTION_TTL_MS,
  pendingActionCleared,
  pendingActionFor,
  pendingActionSaved,
  selectPendingAction,
} from "../slices/pendingAction";
import { selectIsSignedIn, selectSessionUser, signedIn, signedOut } from "../slices/session";
import {
  classChosen,
  curriculumChosen,
  selectTeachingContext,
  subjectsChosen,
  teachingContextHydrated,
} from "../slices/teachingContext";
import { mobileNavToggled, modalClosed, modalOpened, selectOpenModal } from "../slices/ui";

describe("makeStore", () => {
  it("creates independent stores (no shared module state)", () => {
    const a = makeStore();
    const b = makeStore();
    a.dispatch(signedIn({ id: "u1", email: "a@example.com" }));
    expect(selectIsSignedIn(a.getState())).toBe(true);
    expect(selectIsSignedIn(b.getState())).toBe(false);
  });

  it("holds the RTK Query cache plus the four app-wide slices, nothing else", () => {
    expect(Object.keys(makeStore().getState()).sort()).toEqual([
      "api",
      "pendingAction",
      "session",
      "teachingContext",
      "ui",
    ]);
  });
});

describe("session", () => {
  it("starts unknown, then tracks sign-in and sign-out", () => {
    const store = makeStore();
    expect(store.getState().session.status).toBe("unknown");
    store.dispatch(signedIn({ id: "u1", email: null }));
    expect(selectSessionUser(store.getState())).toEqual({ id: "u1", email: null });
    store.dispatch(signedOut());
    expect(store.getState().session).toEqual({ status: "signedOut", user: null });
  });
});

describe("teachingContext", () => {
  it("clears class and subjects when the curriculum changes", () => {
    const store = makeStore();
    store.dispatch(curriculumChosen("nigeria-nerdc"));
    store.dispatch(classChosen("SS 2"));
    store.dispatch(subjectsChosen(["physics", "physics", "chemistry"]));
    expect(selectTeachingContext(store.getState())).toEqual({
      curriculumId: "nigeria-nerdc",
      classLevel: "SS 2",
      subjectIds: ["physics", "chemistry"],
    });

    store.dispatch(curriculumChosen("ghana"));
    expect(selectTeachingContext(store.getState())).toEqual({
      curriculumId: "ghana",
      classLevel: null,
      subjectIds: [],
    });
  });

  it("keeps class and subjects when the same curriculum is chosen again", () => {
    const store = makeStore();
    store.dispatch(
      teachingContextHydrated({
        curriculumId: "kenya-cbc",
        classLevel: "Grade 7",
        subjectIds: ["mathematics"],
      }),
    );
    store.dispatch(curriculumChosen("kenya-cbc"));
    expect(store.getState().teachingContext.classLevel).toBe("Grade 7");
  });
});

describe("ui", () => {
  it("opens one modal at a time and closes only the named one", () => {
    const store = makeStore();
    store.dispatch(mobileNavToggled(true));
    store.dispatch(modalOpened("authGate"));
    expect(selectOpenModal(store.getState())).toBe("authGate");
    expect(store.getState().ui.mobileNavOpen).toBe(false);

    store.dispatch(modalClosed("upgrade"));
    expect(selectOpenModal(store.getState())).toBe("authGate");
    store.dispatch(modalClosed());
    expect(selectOpenModal(store.getState())).toBeNull();
  });
});

describe("pendingAction", () => {
  it("stamps createdAt, defaults autoSubmit and can be cleared", () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000_000);
    const store = makeStore();
    store.dispatch(
      pendingActionSaved({ feature: "lesson", path: "/lessons", values: { topic: "Fractions" } }),
    );
    expect(selectPendingAction(store.getState())).toEqual({
      feature: "lesson",
      path: "/lessons",
      values: { topic: "Fractions" },
      autoSubmit: false,
      createdAt: 1_000_000,
    });
    store.dispatch(pendingActionCleared());
    expect(selectPendingAction(store.getState())).toBeNull();
    vi.useRealTimers();
  });

  it("only returns a fresh action for the matching feature", () => {
    const action = {
      feature: "quiz" as const,
      path: "/quizzes",
      values: {},
      autoSubmit: true,
      createdAt: 0,
    };
    expect(pendingActionFor(action, "quiz", 1000)).toBe(action);
    expect(pendingActionFor(action, "lesson", 1000)).toBeNull();
    expect(pendingActionFor(action, "quiz", PENDING_ACTION_TTL_MS + 1)).toBeNull();
  });
});
