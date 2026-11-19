import { beforeEach, describe, expect, it } from "vitest";
import { PENDING_ACTION_TTL_MS, type PendingAction } from "../slices/pendingAction";
import {
  PENDING_ACTION_STORAGE_KEY,
  readStoredPendingAction,
  writeStoredPendingAction,
} from "../slices/pendingAction.storage";

const action: PendingAction = {
  feature: "lesson",
  path: "/lessons?tab=new",
  values: { topic: "Photosynthesis" },
  autoSubmit: true,
  createdAt: 10_000,
};

describe("pendingAction storage", () => {
  beforeEach(() => sessionStorage.clear());

  it("round-trips an action", () => {
    writeStoredPendingAction(sessionStorage, action);
    expect(readStoredPendingAction(sessionStorage, 20_000)).toEqual(action);
    writeStoredPendingAction(sessionStorage, null);
    expect(sessionStorage.getItem(PENDING_ACTION_STORAGE_KEY)).toBeNull();
  });

  it("drops expired actions", () => {
    writeStoredPendingAction(sessionStorage, action);
    expect(readStoredPendingAction(sessionStorage, 10_000 + PENDING_ACTION_TTL_MS + 1)).toBeNull();
    expect(sessionStorage.getItem(PENDING_ACTION_STORAGE_KEY)).toBeNull();
  });

  it("rejects malformed JSON and off-site paths", () => {
    sessionStorage.setItem(PENDING_ACTION_STORAGE_KEY, "{not json");
    expect(readStoredPendingAction(sessionStorage, 0)).toBeNull();
    writeStoredPendingAction(sessionStorage, { ...action, path: "//evil.example/phish" });
    expect(readStoredPendingAction(sessionStorage, 20_000)).toBeNull();
  });

  it("reads entries written by the legacy app", () => {
    sessionStorage.setItem(
      PENDING_ACTION_STORAGE_KEY,
      JSON.stringify({
        feature: "quiz",
        path: "/app/quiz",
        formData: { topic: "Verbs" },
        ts: 5_000,
      }),
    );
    expect(readStoredPendingAction(sessionStorage, 6_000)).toMatchObject({
      feature: "quiz",
      values: { topic: "Verbs" },
      createdAt: 5_000,
      autoSubmit: false,
    });
  });

  it("never throws when storage is unavailable", () => {
    const broken = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };
    expect(readStoredPendingAction(broken, 0)).toBeNull();
    expect(() => writeStoredPendingAction(broken, action)).not.toThrow();
  });
});
