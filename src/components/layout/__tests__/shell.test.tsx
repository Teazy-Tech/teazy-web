import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { signedIn, signedOut } from "@/store/slices/session";
import { renderWithStore } from "@/test/render";
import { ALL_TOOLS } from "../nav";
import { HeaderAccount } from "../HeaderAccount";
import { ToolsBottomBar } from "../ToolsBottomBar";
import { ToolsSidebar } from "../ToolsSidebar";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/assessment/bulk",
}));

const teacher = { id: "u1", email: "teacher@example.com" };

describe("HeaderAccount", () => {
  it("shows nothing clickable until the session is known", () => {
    renderWithStore(<HeaderAccount />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("offers sign-in and sign-up to visitors", () => {
    const { store } = renderWithStore(<HeaderAccount />);
    store.dispatch(signedOut());
    return screen.findByRole("link", { name: "Start free" }).then((link) => {
      expect(link).toHaveAttribute("href", "/sign-up");
      expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/sign-in");
    });
  });

  it("gives signed-in teachers an account menu with sign-out", async () => {
    const user = userEvent.setup();
    renderWithStore(<HeaderAccount />, {
      preloadedState: { session: { status: "signedIn", user: teacher } },
    });
    await user.click(await screen.findByRole("button", { name: "Account menu" }));
    const menu = await screen.findByRole("menu");
    expect(within(menu).getByText(teacher.email)).toBeInTheDocument();
    expect(within(menu).getByRole("menuitem", { name: /my workspace/i })).toHaveAttribute(
      "href",
      "/workspace",
    );
    expect(within(menu).getByRole("menuitem", { name: "Sign out" })).toBeInTheDocument();
  });
});

describe("ToolsSidebar", () => {
  it("lists every tool and marks the current one", () => {
    renderWithStore(<ToolsSidebar />, {
      preloadedState: { session: { status: "signedOut", user: null } },
    });
    const nav = screen.getByRole("navigation", { name: "Tools" });
    for (const tool of ALL_TOOLS) {
      expect(within(nav).getByRole("link", { name: tool.label })).toHaveAttribute(
        "href",
        tool.href,
      );
    }
    expect(within(nav).getByRole("link", { name: "Bulk marking" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(nav).getByRole("link", { name: "Mark a script" })).not.toHaveAttribute(
      "aria-current",
    );
    expect(within(nav).queryByRole("link", { name: "My Workspace" })).toBeNull();
  });

  it("adds personal pages once signed in", () => {
    const { store } = renderWithStore(<ToolsSidebar />);
    store.dispatch(signedIn(teacher));
    return screen.findByRole("link", { name: "My Workspace" });
  });
});

describe("ToolsBottomBar", () => {
  it("reaches every tool from the All tools sheet", async () => {
    const user = userEvent.setup();
    renderWithStore(<ToolsBottomBar />, {
      preloadedState: { session: { status: "signedOut", user: null } },
    });
    const bar = screen.getByRole("navigation", { name: "Tools" });
    expect(within(bar).getAllByRole("link")).toHaveLength(4);

    await user.click(within(bar).getByRole("button", { name: "All tools" }));
    const sheet = await screen.findByRole("dialog", { name: "All tools" });
    for (const tool of ALL_TOOLS) {
      expect(within(sheet).getByRole("link", { name: tool.label })).toHaveAttribute(
        "href",
        tool.href,
      );
    }

    await user.click(within(sheet).getByRole("link", { name: "Quiz generator" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
