/**
 * RTK Query code generation from the API contract (restructuring plan §6).
 *   pnpm codegen
 * Reads teazy-api's committed openapi.json (sibling checkout by default, or
 * OPENAPI_SCHEMA=<path-or-url>) and writes src/store/generated/api.ts.
 * Requires src/store/baseApi.ts (WEB-02) and openapi.json (API-05).
 * @type {import("@rtk-query/codegen-openapi").ConfigFile}
 */
const config = {
  schemaFile: process.env.OPENAPI_SCHEMA ?? "../teazy-api/openapi/openapi.json",
  apiFile: "./src/store/baseApi.ts",
  apiImport: "baseApi",
  outputFile: "./src/store/generated/api.ts",
  exportName: "api",
  hooks: true,
  tag: true,
};

module.exports = config;
