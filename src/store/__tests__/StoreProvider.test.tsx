import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useAppDispatch, useAppSelector } from "../hooks";
import { pendingActionSaved, selectPendingAction } from "../slices/pendingAction";
import { PENDING_ACTION_STORAGE_KEY } from "../slices/pendingAction.storage";
import { StoreProvider } from "../StoreProvider";

function PendingProbe() {
  const pending = useAppSelector(selectPendingAction);
  const dispatch = useAppDispatch();
  return (
    <>
      <p>{pending ? `pending:${pending.feature}` : "none"}</p>
      <button
        onClick={() =>
          dispatch(
            pendingActionSaved({ feature: "quiz", path: "/quizzes", values: { topic: "Verbs" } }),
          )
        }
      >
        save
      </button>
    </>
  );
}

describe("StoreProvider", () => {
  beforeEach(() => sessionStorage.clear());

  it("restores a pending action saved before a redirect", () => {
    sessionStorage.setItem(
      PENDING_ACTION_STORAGE_KEY,
      JSON.stringify({
        feature: "lesson",
        path: "/lessons",
        values: {},
        autoSubmit: true,
        createdAt: Date.now(),
      }),
    );
    render(
      <StoreProvider>
        <PendingProbe />
      </StoreProvider>,
    );
    expect(screen.getByText("pending:lesson")).toBeInTheDocument();
  });

  it("mirrors new pending actions to sessionStorage", () => {
    render(
      <StoreProvider>
        <PendingProbe />
      </StoreProvider>,
    );
    act(() => screen.getByRole("button", { name: "save" }).click());
    const stored = JSON.parse(sessionStorage.getItem(PENDING_ACTION_STORAGE_KEY) ?? "null");
    expect(stored).toMatchObject({ feature: "quiz", values: { topic: "Verbs" } });
  });
});
