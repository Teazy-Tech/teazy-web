import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithStore } from "@/test/render";
import { ForgotPasswordForm, SignInForm, SignUpForm } from "..";

const router = { replace: vi.fn(), refresh: vi.fn(), push: vi.fn() };
vi.mock("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => "/lessons",
  useSearchParams: () => new URLSearchParams(),
}));

const auth = {
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  resetPasswordForEmail: vi.fn(),
};
vi.mock("../supabase", () => ({
  authClient: () => ({ auth }),
  callbackUrl: (next: string) =>
    `http://localhost:3000/auth/callback?next=${encodeURIComponent(next)}`,
  NOT_CONFIGURED_MESSAGE: "not configured",
}));

beforeEach(() => vi.clearAllMocks());

describe("SignInForm", () => {
  it("signs in and continues to next", async () => {
    auth.signInWithPassword.mockResolvedValue({ data: {}, error: null });
    const user = userEvent.setup();
    renderWithStore(<SignInForm next="/quizzes" />);
    await user.type(screen.getByRole("textbox", { name: /email/i }), " Ada@School.ng ");
    await user.type(screen.getByLabelText(/password/i), "secret");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/quizzes"));
    expect(auth.signInWithPassword).toHaveBeenCalledWith({
      email: "Ada@School.ng",
      password: "secret",
    });
  });

  it("shows a friendly message by error code, never the raw text", async () => {
    auth.signInWithPassword.mockResolvedValue({
      data: {},
      error: { code: "invalid_credentials", message: "Invalid login credentials" },
    });
    const user = userEvent.setup();
    renderWithStore(<SignInForm next="/" />);
    await user.type(screen.getByRole("textbox", { name: /email/i }), "ada@school.ng");
    await user.type(screen.getByLabelText(/password/i), "wrong");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "That email and password don't match",
    );
    expect(screen.queryByText("Invalid login credentials")).not.toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("calls onSuccess instead of navigating inside the auth-gate modal", async () => {
    auth.signInWithPassword.mockResolvedValue({ data: {}, error: null });
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    renderWithStore(<SignInForm next="/" onSuccess={onSuccess} />);
    await user.type(screen.getByRole("textbox", { name: /email/i }), "ada@school.ng");
    await user.type(screen.getByLabelText(/password/i), "secret");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(router.replace).not.toHaveBeenCalled();
  });
});

describe("SignUpForm", () => {
  async function fill(password: string) {
    const user = userEvent.setup();
    await user.type(screen.getByRole("textbox", { name: /email/i }), "ada@school.ng");
    await user.type(screen.getByLabelText(/^password/i, { selector: "input" }), password);
    await user.type(screen.getByLabelText(/confirm password/i), password);
    await user.click(screen.getByRole("button", { name: "Create account" }));
  }

  it("enforces the legacy password rules before calling Supabase", async () => {
    renderWithStore(<SignUpForm next="/" />);
    await fill("weakpass");
    expect(await screen.findByRole("alert")).toHaveTextContent("meet every rule");
    expect(auth.signUp).not.toHaveBeenCalled();
    expect(screen.getByRole("list", { name: "Password rules" })).toHaveTextContent(
      "At least 8 characters (done)",
    );
  });

  it("signs up with a default display name and continues when auto-confirm returns a session", async () => {
    auth.signUp.mockResolvedValue({ data: { session: { access_token: "t" } }, error: null });
    renderWithStore(<SignUpForm next="/lessons" />);
    await fill("Teach3r!x");
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/lessons"));
    expect(auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "ada@school.ng",
        options: expect.objectContaining({ data: { display_name: "ada" } }),
      }),
    );
  });

  it("asks the teacher to check their email when confirmation is required", async () => {
    auth.signUp.mockResolvedValue({ data: { session: null }, error: null });
    renderWithStore(<SignUpForm next="/" />);
    await fill("Teach3r!x");
    expect(await screen.findByText("Check your email")).toBeInTheDocument();
  });
});

describe("ForgotPasswordForm", () => {
  it("sends a reset link to /reset-password and confirms without revealing accounts", async () => {
    auth.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });
    const user = userEvent.setup();
    renderWithStore(<ForgotPasswordForm />);
    await user.type(screen.getByRole("textbox", { name: /email/i }), "ada@school.ng");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));
    expect(await screen.findByText(/If ada@school.ng has a Teazy account/)).toBeInTheDocument();
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith("ada@school.ng", {
      redirectTo: "http://localhost:3000/auth/callback?next=%2Freset-password",
    });
  });
});
