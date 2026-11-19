import { isPendingActionFresh, type PendingAction } from "./pendingAction";

/** Same key as the legacy app, so an action saved just before cut-over still resumes. */
export const PENDING_ACTION_STORAGE_KEY = "teazy_pending_action";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function isPendingAction(value: unknown): value is PendingAction {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.feature === "string" &&
    typeof v.path === "string" &&
    v.path.startsWith("/") &&
    !v.path.startsWith("//") &&
    typeof v.createdAt === "number" &&
    typeof v.values === "object" &&
    v.values !== null
  );
}

/**
 * Reads the stored action. Returns null (and removes the entry) when it is
 * missing, malformed, expired, or points off-site. Never throws: storage can be
 * unavailable in private browsing.
 */
export function readStoredPendingAction(storage: StorageLike, now: number): PendingAction | null {
  try {
    const raw = storage.getItem(PENDING_ACTION_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    // Legacy entries used `ts` and `formData`; accept them once.
    const candidate =
      typeof parsed === "object" && parsed !== null && "ts" in parsed
        ? {
            ...(parsed as Record<string, unknown>),
            createdAt: (parsed as { ts: unknown }).ts,
            values: (parsed as { formData?: unknown }).formData ?? {},
          }
        : parsed;
    if (isPendingAction(candidate) && isPendingActionFresh(candidate, now)) {
      return { ...candidate, autoSubmit: Boolean(candidate.autoSubmit) };
    }
    storage.removeItem(PENDING_ACTION_STORAGE_KEY);
    return null;
  } catch {
    return null;
  }
}

export function writeStoredPendingAction(storage: StorageLike, action: PendingAction | null): void {
  try {
    if (action) storage.setItem(PENDING_ACTION_STORAGE_KEY, JSON.stringify(action));
    else storage.removeItem(PENDING_ACTION_STORAGE_KEY);
  } catch {
    // Storage full or blocked: the action still lives in Redux for this page.
  }
}
