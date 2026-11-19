import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderWithStore } from "@/test/render";
import { PricingPlans } from "../components/PricingPlans";

function plan(name: string) {
  return screen.getByRole("article", { name });
}

describe("PricingPlans", () => {
  it("lets signed-out visitors sign up for each plan, returning to pricing", () => {
    renderWithStore(<PricingPlans />, {
      preloadedState: { session: { status: "signedOut", user: null } },
    });
    expect(within(plan("Free")).getByRole("link", { name: "Start free" })).toHaveAttribute(
      "href",
      "/sign-up",
    );
    expect(
      within(plan("Assessment Pro")).getByRole("link", { name: "Sign up for Assessment Pro" }),
    ).toHaveAttribute("href", `/sign-up?next=${encodeURIComponent("/pricing?plan=pro")}`);
    expect(
      within(plan("Teazy AI Pro")).getByRole("link", { name: "Sign up for Teazy AI Pro" }),
    ).toHaveAttribute("href", `/sign-up?next=${encodeURIComponent("/pricing?plan=standard")}`);
  });

  it("switches currency, announcing the pressed option", async () => {
    const user = userEvent.setup();
    renderWithStore(<PricingPlans />);
    const cedi = screen.getByRole("button", { name: /cedi/i });
    expect(within(plan("Teazy AI Pro")).getByText("₦3,000")).toBeInTheDocument();

    await user.click(cedi);
    expect(cedi).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /naira/i })).toHaveAttribute("aria-pressed", "false");
    expect(within(plan("Teazy AI Pro")).getByText("GH₵30")).toBeInTheDocument();
    expect(within(plan("Free")).getByText("GH₵5")).toBeInTheDocument();
  });

  it("hides sign-up from signed-in teachers", () => {
    renderWithStore(<PricingPlans />, {
      preloadedState: {
        session: { status: "signedIn", user: { id: "u1", email: "t@example.com" } },
      },
    });
    expect(screen.queryByRole("link", { name: /sign up/i })).toBeNull();
    expect(within(plan("Free")).getByRole("link", { name: "Go to your dashboard" })).toBeVisible();
  });
});
