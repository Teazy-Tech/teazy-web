/** Sign-up password rules, the same five checks as the legacy app. */
export const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (pw: string) => pw.length >= 8 },
  { id: "upper", label: "An upper-case letter", test: (pw: string) => /[A-Z]/.test(pw) },
  { id: "lower", label: "A lower-case letter", test: (pw: string) => /[a-z]/.test(pw) },
  { id: "number", label: "A number", test: (pw: string) => /\d/.test(pw) },
  {
    id: "symbol",
    label: "A symbol, such as ! or #",
    test: (pw: string) => /[^A-Za-z0-9]/.test(pw),
  },
] as const;

export type PasswordRuleId = (typeof PASSWORD_RULES)[number]["id"];

export function passwordChecks(password: string): Record<PasswordRuleId, boolean> {
  return Object.fromEntries(PASSWORD_RULES.map((r) => [r.id, r.test(password)])) as Record<
    PasswordRuleId,
    boolean
  >;
}

export function isStrongPassword(password: string): boolean {
  return PASSWORD_RULES.every((r) => r.test(password));
}
