# teazy-web

Frontend for **Teazy AI** (ai.teazytech.online), the AI tool for African teachers: lesson notes, quizzes, worksheets, slides, rubrics, videos, the content simplifier and handwritten-script assessment, aligned to Nigeria NERDC, Ghana NaCCA and Kenya CBC.

This repository replaces the frontend of the Lovable-built `teazy-legacy` app. Its backend is [`teazy-api`](https://github.com/Teazy-Tech/teazy-api). The two repositories share one contract: the API's `openapi.json`.

This README is the single source of project documentation: setup, rules, architecture, decisions and tasks. Source: the Teazy AI repository restructuring plan and intern task assignments (11 Nov 2026). When this file and the plan disagree, change this file in a PR and add an entry under [Decisions](#7-decisions).

**Contents:** [1. Getting started](#1-getting-started) · [2. Rules](#2-rules-read-before-your-first-task) · [3. Architecture](#3-architecture) · [4. State, forms and auth](#4-state-forms-and-auth) · [5. Working with the API contract](#5-working-with-the-api-contract) · [6. Workflow](#6-workflow) · [7. Decisions](#7-decisions) · [8. Tasks](#8-tasks)

|           |                                                                                   |
| --------- | --------------------------------------------------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack, Cache Components), React 19, TypeScript strict |
| State     | Redux Toolkit; RTK Query hooks generated from the API contract                    |
| Forms     | Formik + Zod 4 (`zod-formik-adapter`), through one form kit                       |
| UI        | Tailwind CSS 4, shadcn/ui (Radix), lucide icons                                   |
| Auth      | Supabase Auth via `@supabase/ssr`, **sign-in only**                               |
| Tests     | Vitest + Testing Library (unit), Playwright (E2E)                                 |
| Hosting   | Vercel (preview per PR, staging, production)                                      |

---

## 1. Getting started

Requirements: Node 22+ (`.nvmrc`), pnpm 10 (`npm i -g pnpm` or `corepack enable`).

```sh
pnpm install
cp .env.example .env.local      # fill in from the team password manager
pnpm dev                        # http://localhost:3000
```

To build against the API before an endpoint exists, run `pnpm mock` in `teazy-api` and point `NEXT_PUBLIC_API_URL` at it.

| Command                     | What it does                                                                                             |
| --------------------------- | -------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                  | Dev server (Turbopack)                                                                                   |
| `pnpm build` / `pnpm start` | Production build / serve it                                                                              |
| `pnpm lint`                 | ESLint, including the architecture boundary rules                                                        |
| `pnpm typecheck`            | Generates route types, then `tsc --noEmit`                                                               |
| `pnpm test`                 | Unit tests (Vitest, jsdom). One file: `pnpm vitest run path/to/x.test.tsx`                               |
| `pnpm e2e`                  | Playwright (run `pnpm e2e:install` once to download Chromium). `E2E_BASE_URL` targets a deployed preview |
| `pnpm codegen`              | Regenerates `src/store/generated/api.ts` from `teazy-api/openapi/openapi.json`                           |
| `pnpm format`               | Prettier                                                                                                 |
| `pnpm check`                | lint + typecheck + test + build, the same as CI                                                          |

| Problem                                     | Fix                                                          |
| ------------------------------------------- | ------------------------------------------------------------ |
| `pnpm: command not found`                   | `npm i -g pnpm` (or `corepack enable`)                       |
| `pnpm codegen` can't find the schema        | Clone `teazy-api` next to this repo, or set `OPENAPI_SCHEMA` |
| Playwright says the browser is missing      | `pnpm e2e:install`                                           |
| Type errors about `LayoutProps`/`PageProps` | `pnpm typecheck` (it runs `next typegen` first)              |

---

## 2. Rules (read before your first task)

These apply to people and to coding assistants alike.

### Product rules that never change

- Teazy AI serves teachers in Nigeria, Ghana and Kenya, mostly on **mid-range Android phones and slow, prepaid connections**. Every page must work at phone width and load fast.
- Curriculum content follows **NERDC (Nigeria), NaCCA (Ghana) and CBC (Kenya)**. Prices are shown in **NGN, GHS or KES**, never USD.
- **Teachers review AI output.** No assessment mark is released to a student without a teacher review step in the UI.
- Brand palette: Deep Blue, Dark Orange, Nude, White, defined once as tokens in `src/app/globals.css` (ported 1:1 from legacy). Use the semantic classes (`bg-primary` = Deep Blue, `bg-cta` / `text-cta` = Dark Orange for calls to action, `bg-accent` = soft Nude hover/highlight (not orange, unlike legacy), `bg-secondary` / `bg-muted` = Nude, `text-navy` for headings), never raw hex or hsl values. Keep icons and emojis minimal. Every icon-only button has an accessible label.
- Never use real student data in development, staging, tests, screenshots or fixtures.

### Architecture rules

1. **Supabase is for sign-in only.** Never read or write database tables from the browser or from Next.js server code. Every data read and write goes through `teazy-api` via RTK Query.
2. **Where files go:**

   | You are adding                           | Put it in                                                                                                                                      |
   | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
   | A route (page, layout, loading, error)   | `src/app/(marketing)/`, `(auth)/` or `(app)/`. Keep it thin: compose components from `features/`                                               |
   | Anything specific to one tool or feature | `src/features/<feature>/`                                                                                                                      |
   | App-wide state                           | `src/store/slices/` (session, teachingContext, ui, pendingAction, generation only)                                                             |
   | Form fields                              | `src/components/forms/` (the form kit). Features use the kit; they don't build their own inputs                                                |
   | Shared layout pieces                     | `src/components/layout/`                                                                                                                       |
   | shadcn/ui primitives                     | `src/components/ui/`: `pnpm dlx shadcn@latest add <name>`, then fix the `cn` import to `@/lib/utils` if the CLI changes it. Avoid hand-editing |
   | Helpers with no React or Redux           | `src/lib/`                                                                                                                                     |

3. **Import directions are enforced by ESLint** (`boundaries/dependencies` in `eslint.config.mjs`):
   - `app` → `features`, `store`, `components`, `lib`
   - `features/<x>` → `store`, `components`, `lib`. **Never another feature.** If two features need something, move it to `components/` or `lib/` in its own PR.
   - `components` → `store`, `lib`
   - `store` → `lib`
   - `lib` → nothing inside `src`
4. **State:** server data lives **only in RTK Query** (never copied into a slice). Form state lives in **Formik**. Streaming generation (SSE) uses the `generation` slice and `useGenerationStream`. The store is created per request in `StoreProvider`, never as a module-level singleton.
5. **Next.js 16 conventions:** request interception lives in `src/proxy.ts` (renamed from `middleware.ts` in Next 16). Cache Components is on, so anything that reads cookies, headers or the session must sit inside `<Suspense>`. `"use client"` goes on the smallest component that needs it. This Next.js version has breaking changes from older ones: before using an API, check the version-matched docs in `node_modules/next/dist/docs/`.
6. **Performance:** export libraries (`jspdf`, `docx`, `pptxgenjs`, `mammoth`, `katex`, `file-saver`) load only through dynamic `import()` when the teacher presses Download. Budget: under 250 KB compressed JS on first load for marketing pages and the lessons page. Auth code (Formik, Zod, the Supabase client) is also loaded on demand: the root layout mounts only the lazy `AuthListener` / `AuthGateModal` wrappers. `package.json` declares `"sideEffects": ["*.css"]` so imports from barrel files (`@/components/auth`) drop what they don't use; keep it.
7. **Errors:** show messages by API error `code` (`QUOTA_EXCEEDED`, `UNREADABLE_UPLOAD`, ...). Never show raw error strings, stack traces or provider messages.

### Working rules

- **Work only inside your task's feature or folder.** Shared files (`src/store/makeStore.ts`, `src/store/baseApi.ts`, `src/components/ui/`, `src/components/forms/`, `src/app/layout.tsx`, `eslint.config.mjs`, `package.json`) change only in a PR whose purpose is that change.
- **Never hand-edit generated files:** `src/store/generated/*` (run `pnpm codegen`), `next-env.d.ts`, `pnpm-lock.yaml`. On a conflict, regenerate instead of merging by hand.
- **pnpm only.** Add dependencies in their own PR, or list them in the PR description.
- **Secrets** never go in code, chat or screenshots. Use `.env.local` (from `.env.example`). Only `NEXT_PUBLIC_*` values reach the browser.
- Feature decisions go in the PR description and, if they affect others, in [Decisions](#7-decisions). Architecture changes need tech-lead approval.

### Definition of Done (every task)

- [ ] Acceptance criteria in the task ([§8](#8-tasks)) are met
- [ ] Tests added (unit for components, hooks and slices; E2E for money paths)
- [ ] `pnpm check` green; no new boundary violations or lint disables
- [ ] `pnpm codegen` re-run if the contract changed
- [ ] This README updated if the change affects structure, rules or decisions
- [ ] Reviewed and approved by the folder owner (CODEOWNERS)
- [ ] Works on a phone-sized screen, with keyboard and screen reader

---

## 3. Architecture

```text
                    ┌──────────────────────────────────────────┐
  Teachers ───────► │ teazy-web  (Next.js, Vercel)             │
  (phone, 3G)       │  marketing pages: static                 │
                    │  app pages: Redux + RTK Query + Formik   │
                    └───────────────┬──────────────────────────┘
                     Supabase Auth  │  HTTPS, Bearer JWT
                     (sign-in only) │  /api/v1/*   (OpenAPI contract)
                    ┌───────────────▼──────────────────────────┐
                    │ teazy-api  (Express + TypeScript)        │
                    └──────────────────────────────────────────┘
```

### Folder structure

Planned folders exist in the repo (kept with `.gitkeep`). This is what goes in each and which task fills it.

```text
teazy-web/
├── src/
│   ├── app/                          # Next.js App Router: routing only, thin files
│   │   ├── (marketing)/              # WEB-05  static: home, k12, higher-ed, pricing (privacy, terms once the legal text exists)
│   │   ├── (auth)/                   # WEB-04  sign-in, sign-up, forgot-password, reset-password, OAuth callback
│   │   ├── (app)/                    # WEB-05  signed-in area
│   │   │   ├── layout.tsx            #         tools sidebar (desktop) / bottom bar (phone)
│   │   │   ├── lessons/              # WEB-10
│   │   │   ├── quizzes/              # WEB-11
│   │   │   ├── worksheets/ slides/ rubrics/          # WEB-14
│   │   │   ├── videos/               # AI-17
│   │   │   ├── simplifier/           # AI-16
│   │   │   ├── assessment/           # WEB-16
│   │   │   ├── assessment/bulk/ assessment/batches/[id]/   # WEB-17
│   │   │   ├── workspace/            # WEB-12
│   │   │   ├── dashboard/            # WEB-05, WEB-13
│   │   │   ├── account/              # WEB-15
│   │   │   └── admin/                # WEB-19
│   │   ├── layout.tsx  not-found.tsx  error.tsx  sitemap.ts  robots.ts
│   ├── features/<name>/              # one folder per feature (template below)
│   ├── store/                        # WEB-02
│   │   ├── makeStore.ts              # store factory, one store per request
│   │   ├── StoreProvider.tsx         # client component wrapping the app
│   │   ├── hooks.ts                  # useAppDispatch, useAppSelector, useAppStore
│   │   ├── baseApi.ts                # RTK Query base: token, 401 refresh, error envelope → error.code, Idempotency-Key
│   │   ├── generated/api.ts          # written by pnpm codegen, never hand-edited
│   │   └── slices/                   # session, teachingContext, ui, pendingAction, generation (each unit-tested)
│   ├── components/
│   │   ├── ui/                       # WEB-01  shadcn/ui ported from legacy, brand tokens
│   │   ├── forms/                    # WEB-03  the Formik form kit
│   │   ├── auth/                     # WEB-04  sign-in/up/reset forms, auth-gate modal, useAuthGate, ResumePendingAction
│   │   └── layout/                   # WEB-05, WEB-13  SiteHeader, ToolsSidebar, ToolsBottomBar, nav.ts (every tool, once), OutputToolbar, UsagePanel
│   ├── lib/
│   │   ├── env.ts                    # WEB-01  typed, validated env vars (no Zod: it loads on every page)
│   │   ├── curriculum.ts             # WEB-02  curriculum types + helpers (data from GET /curricula)
│   │   ├── plans.ts                  # WEB-05  plan names, display prices, free allowances (prices move to GET /plans in WEB-15)
│   │   ├── auth/                     # WEB-04  protected routes, safe ?next=, password rules, error messages
│   │   ├── image/                    # WEB-03  on-phone photo compression
│   │   ├── supabase/                 # WEB-04  browser + server clients, session refresh, access token for baseApi; auth only
│   │   └── export/                   # WEB-10, WEB-14  PDF / Word / PowerPoint, loaded with import()
│   ├── test/                         # Vitest setup, renderWithStore helper
│   └── proxy.ts                      # WEB-04  session refresh + redirect signed-out users away from personal pages
├── e2e/                              # Playwright (QA-01 money paths)
├── .github/                          # CI, PR template, issue templates, CODEOWNERS
└── .env.example
```

**Feature folder template:**

```text
features/<name>/
├── components/
├── hooks/
├── <name>.api.ts       # api.enhanceEndpoints: cache tags, small transforms
├── <name>.schema.ts    # Zod form schema
├── <name>.slice.ts     # UI-only state, if needed
├── index.ts            # what app/ routes may import
└── __tests__/
```

Existing features: `marketing` (home, hubs, pricing plans) and `dashboard` (signed-in home), both WEB-05.

Planned features and owners: lessons, quizzes, resources, workspace, usage, billing, account, assessment (Oba); simplifier, videos, bulk-marking (Goodness + Oba); admin (Toye + Oba).

Pages in `app/` stay thin. A page file over ~150 lines is a review flag.

### Rendering and performance

- `next.config.ts` turns on **Cache Components** and **Partial Prefetching**. Marketing pages are static server components in the prerendered shell. App pages are client components using RTK Query, and each route loads only its own code.
- Session-dependent UI streams in behind `<Suspense>` (see `node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md`).
- Bundle budget and Lighthouse on a simulated slow phone are enforced in CI from PERF-01.

### Environments

| Environment | Web                             | API                                    | Auth                         |
| ----------- | ------------------------------- | -------------------------------------- | ---------------------------- |
| Local       | `pnpm dev`                      | `pnpm dev` or `pnpm mock` in teazy-api | Supabase **staging** project |
| Preview     | Vercel preview per PR           | staging API                            | staging                      |
| Staging     | Vercel staging                  | staging API                            | staging                      |
| Production  | Vercel on `ai.teazytech.online` | production API                         | Teazy-owned Supabase project |

### UX findings this frontend must fix

From the frontend assessment report (F-xx); these shape the shared pieces:

- One curriculum/class/subject block with **one class list per curriculum** (fixes "SSS 2 vs SS 2"): `TeachingContextFields`.
- Disabled submit buttons always say why: `SubmitButton`.
- Failed or unreadable uploads can never become "ready to mark" (F-06): `FileUploadField` + the API's `UNREADABLE_UPLOAD` code.
- Raw error strings are never shown to teachers (F-22): messages by error `code`.
- Progress numbers agree between list and detail pages (F-44): progress comes from one API field.
- Edits to generated content are **saved**, not lost on reload.

---

## 4. State, forms and auth

### State (Redux Toolkit + RTK Query)

| Kind of state                 | Where it lives                                        | Example                                                                                                                                                                                                                                                                                                                                                                          |
| ----------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Server data                   | **RTK Query only**                                    | Saved lessons, usage, plans, curricula                                                                                                                                                                                                                                                                                                                                           |
| App-wide UI and session state | Redux slices                                          | `session` (who is signed in: id, email; **not** the plan, which is server data from `GET /subscription`), `teachingContext` (default curriculum, class, subjects), `ui` (the one open app modal, phone nav), `pendingAction` (resume after sign-in; mirrored to sessionStorage `teazy_pending_action` so it survives the Google redirect; values must be plain JSON, no `File`s) |
| Form state                    | **Formik**, local to the form                         | Lesson form, checkout form                                                                                                                                                                                                                                                                                                                                                       |
| Streaming generation          | `generation` slice fed by `useGenerationStream` (SSE) | Lesson note streaming                                                                                                                                                                                                                                                                                                                                                            |

**API calls (`src/store/baseApi.ts`, WEB-02):**

- `pnpm codegen` writes `src/store/generated/api.ts` from the contract; it injects every endpoint into `baseApi`. Import hooks from the generated file; add cache tags or transforms with `api.enhanceEndpoints` in your feature's `<name>.api.ts`.
- `baseApi` attaches the Supabase access token, refreshes it once on a 401, and retries network failures and 502/503/504 twice with backoff.
- Every non-GET request carries an `Idempotency-Key`: the caller's (a generated endpoint passes it when the contract declares the header) or a new one. Retries reuse it. For a "Try again" button, keep the key from the first attempt and pass it again.
- Errors are an `ApiError` (`status`, `code`, `message`, `details`, `requestId`; `src/store/apiError.ts`). Branch on `error.code` and show `apiErrorMessage(error)`, never `error.message` directly (F-22).
- Success bodies stay as the contract sends them (`{ data, meta? }`), so they match the generated types.
- `NEXT_PUBLIC_API_URL` includes `/api/v1`; contract paths are relative to it. Supabase is imported only when the first request needs a token.

### Forms (Formik + Zod): the form kit in `src/components/forms/`

| Component                                                    | Purpose                                                                                                |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `Form`, `SubmitButton`                                       | Formik wrapper; the submit button shows loading and lists missing required fields                      |
| `TextField`, `TextareaField`, `SelectField`, `ComboboxField` | Labelled, accessible inputs bound to Formik                                                            |
| `TeachingContextFields`                                      | **One** curriculum → class → subject block, fed by `GET /curricula`, pre-filled from `teachingContext` |
| `FileUploadField`                                            | Drag/drop + camera; compresses photos on the phone; remove buttons always visible on touch screens     |
| `ErrorSummary`                                               | Lists field errors at the top for screen readers                                                       |

Import everything from `@/components/forms`. A tool form looks like this:

```tsx
<Form schema={lessonSchema} initialValues={initial} onSubmit={generate} aria-label="Lesson details">
  <ErrorSummary /> {/* first: lists problems, takes focus on a failed submit */}
  <TeachingContextFields curricula={curricula} /> {/* curriculumId, classLevel, subjectId */}
  <TextField name="topic" label="Topic" required />
  <SubmitButton pendingLabel="Generating lesson…">Generate</SubmitButton>
</Form>
```

- Validation runs through the feature's Zod schema (`<name>.schema.ts`, via `zod-formik-adapter`). `onSubmit` receives the **parsed** values, so trimming and defaults are already applied. Where possible, mirror the API's request schema.
- Pass `required` to a field when the schema requires it. That drives the asterisk and the "Still needed: …" hint, which appears once the teacher starts filling the form.
- API failures: call `helpers.setStatus({ formError })` with a message chosen by the error `code`, and `ErrorSummary` shows it.
- `SelectField` is a native `<select>` on purpose, because Android shows its own system picker. Use `ComboboxField` for long, searchable lists (`multiple` for `string[]` values).
- `FileUploadField` values are `File[]`, already compressed on the phone (JPEG, at most 1600 px). Keep its `accept` list in step with the API's allowlist. Files can't go into `pendingAction`, so teachers re-select them after sign-in.
- `TeachingContextFields` takes `curricula` as a prop, from the generated `GET /curricula` hook (API-06). Tests use `src/test/fixtures/curricula.ts`.
- The kit is covered by component tests in `src/components/forms/__tests__/`; its first real users are the auth forms (WEB-04). There is no demo page: each tool PR uses the kit for real.

### Auth

- `src/lib/supabase/` holds the `@supabase/ssr` clients: `client.ts` (browser), `server.ts` (route handlers), `proxy.ts` (session refresh). They are used **only** for sign-in, sign-up, password reset, Google OAuth and reading the access token.
- **Who sees what (D9):** tool pages (lessons, quizzes, worksheets, assessment, ...) are open to signed-out visitors. Only `/dashboard`, `/workspace`, `/account` and `/admin` redirect to `/sign-in?next=...` (list in `src/lib/auth/routes.ts`). `src/proxy.ts` makes that check optimistically; the API verifies the JWT on every request.
- **Gating an action** in a tool form:

  ```tsx
  const { requireAuth } = useAuthGate();
  // in onSubmit:
  if (!requireAuth({ feature: "lesson", values, autoSubmit: true })) return;
  // inside <Form>:
  <ResumePendingAction feature="lesson" />;
  ```

  Signed out, this saves the typed values to `pendingAction` (files are dropped), opens the auth-gate modal and stops. After sign-in by email (modal) or Google (full redirect, restored from sessionStorage), `ResumePendingAction` refills the form and re-submits it once.

- Pages: `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, plus `/auth/callback` (Google, email confirmation and reset links). `?next=` is always validated with `safeNextPath`, so it can't redirect off-site.
- Sign-up keeps the legacy rules: five password checks shown live, optional name, and signed in straight away while the Supabase project auto-confirms email (otherwise "check your email").
- Auth errors are shown by Supabase error `code` (`src/lib/auth/errors.ts`), never as raw text. Without Supabase keys the app still runs: everyone is signed out and the forms say auth isn't configured.
- **Supabase project settings (OPS-02):** add `<site>/auth/callback` for every environment (localhost, preview wildcard, staging, production) to the allowed redirect URLs, and enable the Google provider.

---

## 5. Working with the API contract

`teazy-api` publishes `openapi/openapi.json`, generated from its Zod schemas. This repo generates typed RTK Query hooks from it with `@rtk-query/codegen-openapi` (config: `openapi-config.cjs`).

1. The API owner opens a **contract PR** in `teazy-api` (schemas, regenerated `openapi.json`, a route stub returning `501`). The web owner of the slice reviews it.
2. Once it merges, pull `teazy-api` next to this repo and run `pnpm codegen`.
3. Build against the mock (`pnpm mock` in `teazy-api`) until the real endpoint is on staging.
4. Never edit `src/store/generated/api.ts`. Add cache tags and transforms in `src/features/<x>/<x>.api.ts` with `api.enhanceEndpoints`.
5. Breaking changes need a new API version or a deprecation period; the API's CI flags them with `openapi-diff`.

---

## 6. Workflow

### Picking up a task

1. Find the task on the GitHub Projects board (IDs match [§8](#8-tasks)). Move it to **In progress** and assign yourself.
2. Branch from `main`: `git switch -c feat/WEB-10-lessons`. Format: `<type>/<TASK-ID>-short-name`; types `feat`, `fix`, `chore`, `docs`, `test`, `refactor`.
3. Read the task row, §2 of this README, and the code in the folder you're working in.
4. If the task needs an endpoint that doesn't exist yet, ask the API owner for the contract PR first.

### Where does my task go?

Every feature task follows the same shape: a thin route in `src/app/`, everything else in one `src/features/<name>/` folder, built only from the shared kits. If a file you need isn't listed for your task, ask in the PR before creating it. A shared file means a separate PR.

| Task              | Route (thin)                                                                          | Feature folder                               | Uses                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------- |
| WEB-05            | `(app)/layout.tsx`, `(app)/dashboard/`, `(marketing)/*`, `not-found.tsx`, `error.tsx` | `features/marketing/`, `features/dashboard/` | `components/layout/` (SiteHeader, ToolsSidebar, ToolsBottomBar, `nav.ts`), `lib/plans.ts` |
| WEB-10 lessons    | `(app)/lessons/page.tsx`                                                              | `features/lessons/`                          | form kit, `TeachingContextFields`, `useAuthGate`, `generation` slice, `lib/export/`       |
| WEB-11 quizzes    | `(app)/quizzes/page.tsx`                                                              | `features/quizzes/`                          | form kit, `useAuthGate`, `lib/export/`                                                    |
| WEB-12 workspace  | `(app)/workspace/page.tsx`                                                            | `features/workspace/`                        | generated `useGetWorkspaceQuery`; protected route (already in `lib/auth/routes.ts`)       |
| WEB-13            | none                                                                                  | none (shared)                                | `components/layout/OutputToolbar`, `components/layout/UsagePanel`                         |
| WEB-14 resources  | `(app)/worksheets/`, `slides/`, `rubrics/`                                            | `features/resources/`                        | form kit, `OutputToolbar`, `lib/export/`                                                  |
| WEB-15 billing    | `(marketing)/pricing/`, `(app)/account/`                                              | `features/billing/`, `features/account/`     | form kit; `ui.openModal = "checkout"`                                                     |
| WEB-16 assessment | `(app)/assessment/page.tsx`                                                           | `features/assessment/`                       | form kit, `FileUploadField`, `useAuthGate`                                                |
| WEB-17 bulk       | `(app)/assessment/bulk/`, `assessment/batches/[id]/`                                  | `features/bulk-marking/`                     | form kit, `FileUploadField`                                                               |
| AI-16 simplifier  | `(app)/simplifier/page.tsx`                                                           | `features/simplifier/`                       | form kit, `TeachingContextFields` (`showSubject={false}`)                                 |
| AI-17 videos      | `(app)/videos/page.tsx`                                                               | `features/videos/`                           | form kit, job polling                                                                     |
| WEB-19 admin      | `(app)/admin/page.tsx`                                                                | `features/admin/`                            | form kit; protected route                                                                 |

Copy the feature folder template in [§3](#3-architecture). For a working form today, read the auth forms in `src/components/auth/` (schema, form kit, error handling by code). The first tool feature (WEB-10 lessons) becomes the reference feature folder that later tools copy. Every tool already has its entry in `src/components/layout/nav.ts` (sidebar, bottom bar, hubs, dashboard): your PR adds the route at that `href`; rename or remove the entry there, never add a second list.

### Walk-through for new interns (OPS-03)

The rules in this README are done when each intern can answer these from the README alone. The facilitator runs it once with each person and ticks their name in the OPS-03 card.

1. You're given WEB-11. Which two folders will you create, and which file must stay under ~150 lines?
2. Your quiz form needs a class picker. What do you import, and from where?
3. You need the list of saved quizzes. Where does that data live, and why not in a slice?
4. A teacher who isn't signed in presses Generate. What happens, and which two pieces make it resume?
5. Two features need the same helper. Where does it go, and in what kind of PR?
6. `pnpm lint` reports `boundaries/dependencies`. What does it mean, and what must you not do?
7. The API returns `QUOTA_EXCEEDED`. How does the teacher see it?

### Commits and PRs

- [Conventional Commits](https://www.conventionalcommits.org/) with the task ID as scope: `feat(WEB-10): stream lesson notes over SSE`.
- One task per PR, ideally under ~400 changed lines (generated files excluded). Fill in the PR template, including **phone and desktop screenshots**.
- Run `pnpm check` before pushing; CI runs the same steps.
- `main` is protected: 1 approval from the folder owner (CODEOWNERS), green CI, squash merge only. Nobody pushes to `main` directly, bots included.
- After merge: move the card to **Done** and post the preview or staging link in the daily update.

### Reviews

Reviewers check, in order: (1) acceptance criteria met; (2) files in the right folders, no boundary exceptions; (3) server data kept out of slices, forms on the form kit; (4) phone width, keyboard and screen reader; (5) tests cover behaviour, not just rendering. Review within one working day.

### Rhythm

- **Daily:** short written update in the team channel (done / doing / blocked). Stuck for more than half a day? Post what you've tried.
- **Weekly (30 min):** demo of merged work from staging, then re-plan on the board. Facilitator rotates: Oba (Wk 1, 4, 7), Toye (Wk 2, 5, 8), Goodness (Wk 3, 6).

---

## 7. Decisions

Each decision needs tech-lead approval. Status: **Proposed** until sign-off (plan §11, question 1). To change one, add a new entry that supersedes it; don't rewrite history.

| #   | Decision                                                                                                                                                                                        | Why                                                                                                                                         | Alternatives rejected                                                                                                       | Consequences                                                                                                                          |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | **Two repositories:** `teazy-web` and `teazy-api`. The current repo becomes `teazy-legacy`, serving production until the 21 Jan cut-over                                                        | Separate ownership, CI and deploys; frontend and backend never block each other                                                             | pnpm + Turborepo monorepo (couples pipelines, more tooling); keep evolving legacy (Lovable commits collide, no review gate) | No shared types package; the OpenAPI contract (D6) replaces it. Cross-repo changes need two PRs, contract first                       |
| D2  | **Next.js App Router (TypeScript strict)** for marketing pages and the app                                                                                                                      | One framework; static marketing pages for SEO and WhatsApp previews; app pages load per route                                               | Vite SPA + Astro site (two frameworks, two deploys); Vite SPA only (poor SEO)                                               | Team learns server/client boundaries; store created per request; Vercel hosting                                                       |
| D4  | **Redux Toolkit** for state, **RTK Query** for API calls, endpoints generated from `openapi.json`                                                                                               | One state system; typed hooks from the contract                                                                                             | TanStack Query + Zustand (two systems); TanStack Query only (no home for cross-page UI state)                               | `pnpm codegen` re-runs on every contract change; SSE handled outside RTK Query                                                        |
| D5  | **Formik** forms validated with **Zod** via `zod-formik-adapter`, all through one form kit                                                                                                      | Team preference; same Zod as the API                                                                                                        | react-hook-form (legacy); TanStack Form (less familiar)                                                                     | Formik is low-maintenance upstream, but swapping it touches one folder                                                                |
| D6  | **OpenAPI is the contract** between the repos: generated from the API's Zod schemas, consumed here by codegen, mocked with Prism                                                                | Frontend and backend build in parallel against one written agreement                                                                        | Shared TypeScript package (impossible across two repos)                                                                     | Contract PRs first; CI freshness checks on both sides                                                                                 |
| D7  | **Next.js 16 conventions:** `src/proxy.ts` instead of `middleware.ts`; keep Cache Components and Partial Prefetching on; `agentRules: false` so all docs stay in this README                    | The scaffold is Next 16.4, where `middleware.ts` is deprecated and these are defaults                                                       | Pin Next 15 (older major, upgrade soon after); turn Cache Components off (loses the instant static shell)                   | Session reads inside `<Suspense>`; Supabase SSR examples need the file/export renamed. Turning Cache Components off later is one line |
| D9  | **Tool pages stay open to signed-out visitors**; the action is gated with the auth-gate modal and resumed via `pendingAction`. Only dashboard, workspace, account and admin redirect to sign-in | Same as legacy production: teachers can try a tool before signing up (conversion); the plan's `pendingAction` slice exists for exactly this | Redirect all of `(app)` (simpler, but visitors can't try a tool first)                                                      | Every tool form uses `useAuthGate` + `<ResumePendingAction>`; the protected list lives in `src/lib/auth/routes.ts`                    |
| D10 | **Colour tokens:** Dark Orange is the `cta` token; `accent` is a soft Nude tint for hover/highlight states                                                                                      | shadcn uses `accent` for hovers, so legacy's orange `accent` turned every menu hover and open combobox solid orange                         | Keep legacy mapping (loud, inconsistent hovers)                                                                             | Ported legacy code changes `bg-accent`/`text-accent` to `bg-cta`/`text-cta` where it meant orange                                     |
| D11 | **Submit buttons are never disabled** (not even `aria-disabled`); once the form is started, a hint under the button names the missing fields                                                    | Screen readers announce disabled buttons as unavailable, and the legacy grey button gave no reason (frontend finding)                       | Disabled or `aria-disabled` button with a tooltip                                                                           | Pressing an incomplete form shows `ErrorSummary` and moves focus to it                                                                |
| D12 | **Phone navigation:** a bottom bar with four slots (Lessons, Quizzes, Worksheets or Workspace, Mark) plus **All tools**, a sheet listing every tool; desktop has the full sidebar               | Nine tools don't fit one row at 360 px with readable labels and 44 px targets; one list (`nav.ts`) feeds both, so they never drift          | All tools in a sideways-scrolling bar (hidden tools nobody finds); hamburger only (every tool two taps, no thumb reach)     | On phones the four main places are one tap and the rest two; which four is one line in `bottomBarItems()`                             |

D3 (Express API) and D8 (TypeScript 5.9) are recorded in `teazy-api`. Numbers are shared across both repos: a new decision takes the next free number in either README.

---

## 8. Tasks

**Deadline:** Fri 22 Jan 2027. Production cut-over Thu 21 Jan. Code freeze Tue 19 Jan. Holiday break (no work) Mon 21 Dec – Fri 1 Jan. Every PR is merged or parked by Fri 18 Dec. Effort: S = 0.5 day, M = 2 days, L = 4 days. The GitHub Projects board is the live status; this table is the reference for scope.

### Owners

| Intern       | Track        | Owns in this repo                                                             |
| ------------ | ------------ | ----------------------------------------------------------------------------- |
| **Oba**      | Frontend     | Everything by default: `app/`, `features/`, `store/`, `components/`; UX fixes |
| **Goodness** | AI layer     | `features/simplifier`, `features/videos`, `features/bulk-marking` (with Oba)  |
| **Toye**     | API platform | `features/admin` (with Oba); CI/CD support; PERF-01                           |

**Tech lead:** approves decisions and any PR that changes checkout/billing or the release of assessment marks.

### Phase 0: repository setup (done)

- [x] Next.js 16 app (App Router, `src/`, TypeScript strict, Tailwind 4, Turbopack, Cache Components)
- [x] pnpm with every planned runtime dependency installed
- [x] ESLint with boundary rules (tested against deliberate violations), Prettier, Vitest + Testing Library, Playwright, RTK Query codegen config
- [x] Folder skeleton (§3), `.env.example`, `.nvmrc`, `.editorconfig`, `.gitattributes`
- [x] CI workflow, PR template with the Definition of Done, issue templates, CODEOWNERS (placeholder handles)

Still open from setup (OPS-01, Toye): protect `main`, replace the CODEOWNERS placeholder handles, connect Vercel, create the Projects board.

### Task list

| ID          | Task                                                                                                                                                                                      | Owner    | Wk   | Size | Depends on              | Acceptance criteria                                                                                                                                                                                                                                                                                                                                           |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---- | ---- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **OPS-01**  | Repos, protected `main`, CODEOWNERS, PR/issue templates, Projects board with every task ID                                                                                                | Toye     | 1    | M    | Tech-lead org access    | Direct pushes to `main` rejected; PR template has the DoD; board has all tasks with owners                                                                                                                                                                                                                                                                    |
| **OPS-03**  | Rules and contributing docs for both repos; decision records D1–D6                                                                                                                        | Oba      | 1    | M    | OPS-01                  | An intern with only this README and a task ID puts files in the right place. _Docs done (rules §2, workflow + task lookup + walk-through §6, decisions §7); remaining: walk-through with each intern + tech-lead approval_                                                                                                                                    |
| **WEB-01**  | Scaffold: Tailwind **brand tokens**, shadcn/ui ported from legacy, ESLint + boundaries, Vitest + RTL, Playwright, `lib/env.ts`, folders                                                   | Oba      | 1    | M    | OPS-01                  | `pnpm dev/test/lint/typecheck/build` work; Vercel preview per PR. _Done except the Vercel connection (needs org access, OPS-01)_                                                                                                                                                                                                                              |
| **WEB-02**  | Store: `makeStore` + `StoreProvider`, slices (Wk 1); `baseApi` + `pnpm codegen` (Wk 3)                                                                                                    | Oba      | 1, 3 | M    | API-05 (codegen)        | Generated hooks compile against the Prism mock; slices unit-tested; no server data in slices. _Done except the Prism check: store, slices, `baseApi` (token, 401 refresh, retry, `Idempotency-Key`, typed `ApiError`) and the codegen wiring (checked against a sample spec). Waiting on API-05 for `openapi.json`, the Prism run and the CI freshness check_ |
| **WEB-03**  | Formik form kit, including `SubmitButton` with missing-field hint, `ErrorSummary`, `FileUploadField`, **`TeachingContextFields`**                                                         | Oba      | 1–2  | L    | WEB-02                  | Keyboard and screen-reader usable; covered by component tests (instead of a demo page); used unchanged by every later feature _Done_                                                                                                                                                                                                                          |
| **WEB-04**  | Auth: `@supabase/ssr`, `src/proxy.ts`, sign-in, sign-up, **forgot/reset password**, Google button, auth-gate modal via `pendingAction`                                                    | Oba      | 2–3  | L    | WEB-02, OPS-02          | Password reset works; an action interrupted by sign-in resumes with the values typed _Done except an end-to-end run against real Supabase (needs OPS-02 staging keys) and Google provider setup_                                                                                                                                                              |
| **WEB-05**  | App shell: tools sidebar / bottom bar, header, 404 and error pages; marketing pages ported as static pages; no rotating banner on tool pages                                              | Oba      | 3    | M    | WEB-01                  | Every tool reachable in one tap; signed-out visitors can sign up from pricing. _Done: phones get 4 bottom-bar slots + an "All tools" sheet (D12); Privacy/Terms links wait for the legal text (F-67); tool routes arrive with their tasks_                                                                                                                    |
| **WEB-10**  | Lessons: form, SSE stream rendering, editor that **saves edits**, text-based PDF/Word export (lazy-loaded), "Saved" status                                                                | Oba      | 3–4  | L    | WEB-03, AI-10           | Edits survive reload; PDF text is selectable; export libraries absent from first load                                                                                                                                                                                                                                                                         |
| **WEB-11**  | Quizzes: form, show/hide answers, **print, PDF, Word, copy**, regenerate with a quota hint                                                                                                | Oba      | 4    | M    | AI-11                   | A teacher can print a quiz with a separate answer key                                                                                                                                                                                                                                                                                                         |
| **WEB-12**  | Workspace: one list with filters, search, cursor pagination, labelled icon buttons, designed confirm dialogs                                                                              | Oba      | 5    | M    | API-10                  | Works at phone width; every icon button has a label                                                                                                                                                                                                                                                                                                           |
| **WEB-13**  | Shared `OutputToolbar` (Copy · Edit · PDF · Word · Print · Saved) and `UsagePanel` on lessons and quizzes                                                                                 | Oba      | 5    | M    | API-11                  | Same toolbar and usage panel on every tool page                                                                                                                                                                                                                                                                                                               |
| **WEB-14**  | Worksheets, slides, rubrics; port `WorksheetDocument`, `worksheetExport`, PPTX export                                                                                                     | Oba      | 5–6  | M    | AI-12, WEB-13           | Preview and PDF match (`[data-ws-block]` rule kept); all three auto-save                                                                                                                                                                                                                                                                                      |
| **PERF-01** | Bundle-size budget and Lighthouse on a simulated slow phone in CI                                                                                                                         | Toye     | 6    | S    | WEB-01, API-07          | A PR over budget fails CI; first load under 250 KB compressed JS on home and lessons                                                                                                                                                                                                                                                                          |
| **WEB-15**  | Pricing, checkout modal, account page: one plan vocabulary (Free · Teazy AI Pro · Assessment Pro), Paystack/Flutterwave launch, manage/cancel subscription, edit profile/teaching context | Oba      | 6–7  | L    | API-13                  | Assessment Pro button opens Assessment Pro; cancel works on staging; **tech-lead review**                                                                                                                                                                                                                                                                     |
| **AI-17**   | Video page (with the API `videos` module), pricing decision applied                                                                                                                       | Goodness | 6    | M    | API-12, open question 5 | Limit/price shown matches the decision                                                                                                                                                                                                                                                                                                                        |
| **WEB-19**  | Admin page using the form kit                                                                                                                                                             | Toye     | 7–8  | M    | API-16, WEB-03          | Admin can manage flags, settings and promo codes on staging                                                                                                                                                                                                                                                                                                   |
| **WEB-16**  | Single assessment: stepper, OCR status per page, OCR review always visible, marks editable **and saved**, release after review                                                            | Oba      | 7–8  | L    | AI-13, AI-14            | A failed page can be retried or removed; corrected marks persist with a review entry                                                                                                                                                                                                                                                                          |
| **AI-16**   | Content Simplifier page (with the API `simplifier` module)                                                                                                                                | Goodness | 7–8  | M    | AI-11, WEB-03           | Teacher pastes text, picks a class, gets a simpler version; saved to the workspace                                                                                                                                                                                                                                                                            |
| **WEB-17**  | Bulk-marking upload page + batch list/detail with live progress (`GET /jobs/:id`)                                                                                                         | Goodness | 8    | M    | AI-15, WEB-03           | Progress matches between list and detail; dialogs close with Escape                                                                                                                                                                                                                                                                                           |
| **QA-01**   | Playwright money paths: sign up → generate lesson → pay (Paystack test mode) → download; sign in → mark script → review                                                                   | Oba      | 8    | M    | WEB-10, WEB-15, WEB-16  | Runs in CI against preview + staging before the Tue 19 Jan code freeze                                                                                                                                                                                                                                                                                        |

If the team falls behind, scope moves out in this order: videos (AI-17), admin page (WEB-19), simplifier (AI-16). The cut-over depends on none of them.

### Hand-offs that block this repo

| Date        | Hand-off                                                              | Unblocks                                  |
| ----------- | --------------------------------------------------------------------- | ----------------------------------------- |
| Wed 2 Dec   | API-05 (OpenAPI + mock) and the API-06 contract merged in `teazy-api` | WEB-02 codegen, WEB-10                    |
| Mon 7 Dec   | API-06 (`me` + `curriculum`) live and approved as the template        | `TeachingContextFields` against real data |
| Every slice | Contract PR in `teazy-api` (API owner writes, web owner reviews)      | That slice's web feature                  |

### Slice pairing

| Slice                                  | API owner | Web owner |
| -------------------------------------- | --------- | --------- |
| Profile + curriculum (reference slice) | Toye      | Oba       |
| Lessons, quizzes, resources            | Goodness  | Oba       |
| Workspace                              | Toye      | Oba       |
| Usage                                  | Oba       | Oba       |
| Billing (plans, checkout, account)     | Toye      | Oba       |
| Single assessment + OCR                | Goodness  | Oba       |
| Bulk marking + batches                 | Goodness  | Goodness  |
| Simplifier, videos                     | Goodness  | Goodness  |
| Admin                                  | Toye      | Toye      |
