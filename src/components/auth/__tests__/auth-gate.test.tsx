import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { Form, SubmitButton, TextField } from "@/components/forms";
import { signedIn, signedOut } from "@/store/slices/session";
import { renderWithStore } from "@/test/render";
import { ResumePendingAction, useAuthGate } from "..";
import { toPendingValues } from "../pendingValues";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/lessons",
  useSearchParams: () => new URLSearchParams("tab=new"),
}));

const schema = z.object({ topic: z.string().min(1, "Enter a topic") });

function GatedTool({ onGenerate }: { onGenerate: (topic: string) => void }) {
  const { requireAuth } = useAuthGate();
  return (
    <Form
      schema={schema}
      initialValues={{ topic: "" }}
      onSubmit={(values) => {
        if (!requireAuth({ feature: "lesson", values, autoSubmit: true })) return;
        onGenerate(values.topic);
      }}
    >
      <ResumePendingAction feature="lesson" />
      <TextField name="topic" label="Topic" required />
      <SubmitButton>Generate</SubmitButton>
    </Form>
  );
}

beforeEach(() => sessionStorage.clear());

describe("auth gate + pending action", () => {
  it("opens the modal for signed-out teachers and resumes with their values after sign-in", async () => {
    const onGenerate = vi.fn();
    const user = userEvent.setup();
    const { store } = renderWithStore(<GatedTool onGenerate={onGenerate} />);
    store.dispatch(signedOut());

    await user.type(screen.getByRole("textbox", { name: /topic/i }), "Photosynthesis");
    await user.click(screen.getByRole("button", { name: "Generate" }));

    expect(onGenerate).not.toHaveBeenCalled();
    expect(store.getState().ui.openModal).toBe("authGate");
    expect(store.getState().pendingAction.action).toMatchObject({
      feature: "lesson",
      path: "/lessons?tab=new",
      values: { topic: "Photosynthesis" },
      autoSubmit: true,
    });

    act(() => {
      store.dispatch(signedIn({ id: "teacher-1", email: "ada@school.ng" }));
    });
    await waitFor(() => expect(onGenerate).toHaveBeenCalledWith("Photosynthesis"));
    expect(onGenerate).toHaveBeenCalledTimes(1);
    expect(store.getState().pendingAction.action).toBeNull();
  });

  it("restores typed values after a full-page reload (e.g. Google sign-in)", async () => {
    const onGenerate = vi.fn();
    renderWithStore(<GatedTool onGenerate={onGenerate} />, {
      preloadedState: {
        session: { status: "signedIn", user: { id: "t", email: null } },
        pendingAction: {
          action: {
            feature: "lesson",
            path: "/lessons",
            values: { topic: "Fractions" },
            autoSubmit: false,
            createdAt: Date.now(),
          },
        },
      },
    });
    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: /topic/i })).toHaveValue("Fractions"),
    );
    expect(onGenerate).not.toHaveBeenCalled(); // autoSubmit false: teacher presses Generate
  });

  it("lets signed-in teachers straight through", async () => {
    const onGenerate = vi.fn();
    const user = userEvent.setup();
    const { store } = renderWithStore(<GatedTool onGenerate={onGenerate} />);
    store.dispatch(signedIn({ id: "t", email: null }));
    await user.type(screen.getByRole("textbox", { name: /topic/i }), "Verbs");
    await user.click(screen.getByRole("button", { name: "Generate" }));
    await waitFor(() => expect(onGenerate).toHaveBeenCalledWith("Verbs"));
    expect(store.getState().ui.openModal).toBeNull();
  });
});

describe("toPendingValues", () => {
  it("drops files and keeps plain JSON", () => {
    const file = new File(["x"], "page.jpg", { type: "image/jpeg" });
    expect(
      toPendingValues({
        topic: "Verbs",
        pages: [file],
        nested: { cover: file, n: 2 },
        when: undefined,
      }),
    ).toEqual({
      topic: "Verbs",
      pages: [],
      nested: { n: 2 },
    });
  });
});
