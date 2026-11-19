/**
 * Makes form values safe to keep in `pendingAction` (and sessionStorage):
 * drops File/Blob values (uploads are re-selected after sign-in) and anything
 * that isn't plain JSON.
 */
export function toPendingValues(values: Record<string, unknown>): Record<string, unknown> {
  const isBinary = (v: unknown) =>
    (typeof Blob !== "undefined" && v instanceof Blob) ||
    (typeof File !== "undefined" && v instanceof File);
  const clean = (v: unknown): unknown => {
    if (isBinary(v)) return undefined;
    if (Array.isArray(v)) {
      if (v.some(isBinary)) return [];
      return v.map(clean);
    }
    if (v && typeof v === "object") {
      return Object.fromEntries(
        Object.entries(v as Record<string, unknown>)
          .map(([k, inner]) => [k, clean(inner)] as const)
          .filter(([, inner]) => inner !== undefined),
      );
    }
    if (typeof v === "function" || typeof v === "symbol" || typeof v === "bigint") return undefined;
    return v;
  };
  return JSON.parse(JSON.stringify(clean(values) ?? {})) as Record<string, unknown>;
}
