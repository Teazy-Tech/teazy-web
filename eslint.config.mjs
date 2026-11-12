import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

/**
 * Architecture rules (README.md §2, "Architecture rules").
 * A failing `boundaries/dependencies` error means a file imports from a layer
 * it must not depend on. Fix the import, don't disable the rule.
 */
const boundaryRules = {
  files: ["src/**/*.{ts,tsx}"],
  plugins: { boundaries },
  settings: {
    "import/resolver": { typescript: { alwaysTryTypes: true } },
    "boundaries/elements": [
      { type: "app", pattern: "src/app" },
      { type: "feature", pattern: "src/features/*", capture: ["feature"] },
      { type: "store", pattern: "src/store" },
      { type: "components", pattern: "src/components" },
      { type: "lib", pattern: "src/lib" },
      { type: "test", pattern: "src/test" },
    ],
  },
  rules: {
    "boundaries/dependencies": [
      2,
      {
        default: "disallow",
        policies: [
          // Imports inside the same element (e.g. within one feature) are always fine.
          { allow: { dependency: { relationship: { to: "internal" } } } },
          // Routes compose features; they never hold logic of their own.
          {
            from: { element: { type: "app" } },
            allow: { to: { element: { types: ["feature", "store", "components", "lib"] } } },
          },
          // A feature may use shared layers but never another feature.
          {
            from: { element: { type: "feature" } },
            allow: { to: { element: { types: ["store", "components", "lib"] } } },
          },
          { from: { element: { type: "store" } }, allow: { to: { element: { type: "lib" } } } },
          {
            from: { element: { type: "components" } },
            allow: { to: { element: { types: ["store", "lib"] } } },
          },
          {
            from: { element: { type: "test" } },
            allow: { to: { element: { types: ["store", "components", "lib", "feature"] } } },
          },
        ],
      },
    ],
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  boundaryRules,
  {
    // Generated files are never hand-edited, so they are not linted either.
    files: ["src/store/generated/**", "src/components/ui/**"],
    rules: { "boundaries/dependencies": "off" },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    "next-env.d.ts",
    "src/store/generated/**",
  ]),
]);

export default eslintConfig;
