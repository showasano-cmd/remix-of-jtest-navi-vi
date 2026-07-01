# J.TEST Navi Vietnam

A single-page diagnostic tool that tells Vietnamese learners of Japanese whether they can realistically reach a required J.TEST / JLPT certification level before a target date, and which exam path gets them there fastest.

## Project Overview

### Purpose

J.TEST Navi Vietnam answers one question for the user: **"Can I get certified in time, and what should I do right now?"**

The user picks one of two goals, enters their current level and target date, and receives an instant diagnosis: months remaining, upcoming exam opportunities, the fastest qualifying path (J.TEST or JLPT), and a short list of next actions. It is a lead-generation and self-diagnosis tool, not a learning platform — it does not teach Japanese or track study progress.

### Target Users

- Vietnamese learners of Japanese planning to enroll in a Japanese language school (du học) and needing J.TEST Cấp độ F / JLPT N5.
- Vietnamese high school (THPT) students who want to use a Japanese certificate to satisfy the foreign-language exemption requirement, needing J.TEST Cấp độ D / JLPT N3.

### Core Concept

1. **Choose a goal** — Japanese language school admission, or THPT foreign-language exemption.
2. **Enter current status** — target month/year and current level.
3. **Get an instant diagnosis** — remaining time, exam calendar, fastest route, and a pass/warn/danger status.
4. **Act** — the result screen funnels the user toward PreCheck (a free level-check tool), then FGPS, then formal exam registration.

The whole flow is designed to complete in roughly 30 seconds, with no account creation.

## Current Implemented Features

| Feature | Description |
| --- | --- |
| Goal selection | Two goal cards: "Du học Trường Nhật ngữ" (school admission) and "Miễn thi môn Ngoại ngữ THPT" (exam exemption). |
| Dynamic input form | For the school goal: target intake month (Jan/Apr/Jul/Oct, starting 3 months from now, up to 3 years out) and current level (already qualified / currently studying / not started). For the THPT goal: target exam year (next 3 upcoming years) and current level (N3+/N4-equivalent/N5-equivalent/below N5). |
| Diagnosis engine | Pure client-side calculation of months remaining, minimum preparation time by level, and the resulting earliest eligible exam date. |
| Exam calendar generation | Generates J.TEST sessions (odd months, day 15) and JLPT sessions (July and December) between now and the target date. |
| Fastest-path comparison | Compares the next eligible J.TEST session against the next eligible JLPT session and highlights whichever comes first. |
| Status classification | Classifies the outcome as "Có thể đạt được" (achievable), "Chú ý" (caution), or "Nguy hiểm" (at risk) based on remaining time vs. required preparation time. |
| Result screen | Conclusion summary card followed by five numbered sections: current status, requirement check, J.TEST vs JLPT comparison, recommended timeline, and immediate next actions. |
| PreCheck CTA | Links out to an external PreCheck tool. The link target depends on the user's goal/level (`precheck-fg-01.lovable.app` or `precheck-de-01.lovable.app`), and appears both inline in the action list and in a sticky bottom bar. |
| FGPS / registration mentions | The result screen references FGPS and final exam registration as follow-up steps, but these are text-only at present — no linked integration exists yet. |
| Reset flow | "Làm lại" button clears all inputs and returns to the start of the flow. |
| SEO/meta tags | Page-level `title`, `description`, Open Graph, and Twitter Card meta tags configured per route. |
| 404 and error boundaries | Custom not-found page and a root-level React error boundary with Lovable error reporting hooked in. |

No user accounts, no database, and no analytics integration currently exist in the codebase.

## Technology Stack

| Layer | Technology |
| --- | --- |
| Framework | [TanStack Start](https://tanstack.com/start) (React 19) |
| Routing | TanStack Router — file-based routing |
| Data/query layer | TanStack Query (`QueryClientProvider` wired at the root, not currently used for any live queries) |
| Styling | Tailwind CSS v4 (`@theme inline`, OKLCH color tokens) |
| Component library | shadcn/ui ("new-york" style) on top of Radix UI primitives |
| Icons | lucide-react |
| Forms/validation | react-hook-form and Zod are installed (used for the example server function; the main diagnostic form uses plain React state, not react-hook-form) |
| Build tool | Vite 7, via `@lovable.dev/vite-tanstack-config` |
| Server build target | Nitro (Cloudflare Workers preset by default, configurable) |
| Package manager | Bun (`bun.lock`, `bunfig.toml`) |
| Linting/formatting | ESLint (typescript-eslint, react-hooks, react-refresh) + Prettier |
| Project scaffold/hosting workflow | [Lovable](https://lovable.dev) (`tanstack_start_ts` template) |

## Repository Structure

```
.
├── .lovable/                    Lovable project metadata (template id)
├── src/
│   ├── components/
│   │   └── ui/                  shadcn/ui primitives (button, card, dialog, etc.)
│   ├── hooks/
│   │   └── use-mobile.tsx       Responsive breakpoint hook
│   ├── lib/
│   │   ├── api/
│   │   │   └── example.functions.ts   Example TanStack server function (unused boilerplate)
│   │   ├── config.server.ts     Server-only config accessor (env vars)
│   │   ├── error-capture.ts     Captures uncaught SSR errors
│   │   ├── error-page.ts        Renders a static fallback error page
│   │   ├── lovable-error-reporting.ts   Forwards client errors to Lovable's runtime
│   │   └── utils.ts             `cn()` className helper (clsx + tailwind-merge)
│   ├── routes/
│   │   ├── __root.tsx           App shell: HTML document, meta tags, error/not-found boundaries
│   │   ├── index.tsx            The entire diagnostic tool (goal select → input → result)
│   │   └── README.md            File-based routing conventions for this project
│   ├── routeTree.gen.ts         Auto-generated route tree (do not edit manually)
│   ├── router.tsx                Router + QueryClient instantiation
│   ├── server.ts                 SSR entry wrapper with error normalization
│   ├── start.ts                  TanStack Start instance + server error middleware
│   └── styles.css                Tailwind v4 theme, design tokens, global styles
├── components.json               shadcn/ui configuration
├── eslint.config.js
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md                     This file
├── CHANGELOG.md
└── docs/
    ├── UX_v1.md                  UX design rationale
    └── ROADMAP.md                Version-based development roadmap
```

Almost all product logic lives in a single file, `src/routes/index.tsx`, which implements the goal selector, input form, diagnosis calculation, and result screen. `src/components/ui/` contains only generic shadcn/ui primitives; none are currently composed into custom page-level components outside of `index.tsx`.

## How to Run Locally

Prerequisites: [Bun](https://bun.sh) (the project is set up with `bun.lock`; npm/pnpm/yarn can also read `package.json` if Bun is unavailable, but lockfile-exact installs require Bun).

```bash
# Install dependencies
bun install

# Start the dev server
bun run dev

# Type-check / lint
bun run lint

# Format
bun run format

# Production build
bun run build

# Preview the production build locally
bun run preview
```

The dev server runs via `vite dev`, using the `@lovable.dev/vite-tanstack-config` preset (which wires up TanStack Start, React, Tailwind, path aliases, and Lovable's dev-only tooling automatically — do not add these plugins manually in `vite.config.ts`).

## How to Publish from Lovable

This project is built and iterated on primarily through the Lovable editor:

1. Open the project in Lovable and make changes via prompts or the visual/code editor.
2. Lovable commits changes automatically to this GitHub repository (commits authored by `gpt-engineer-app[bot]`, co-authored by the project owner).
3. Review the change (Lovable shows a diff/preview before or after committing).
4. Use Lovable's **Publish** action to deploy the current `main` branch to Lovable's hosting.
5. Optionally attach a custom domain from the Lovable project settings.

Because Lovable pushes directly to GitHub, `main` is effectively the source of truth — changes made locally and pushed to GitHub will sync back into the Lovable editor.

## Current Deployment Flow

- **Source control:** GitHub (this repository), kept in sync with the Lovable editor.
- **Hosting:** Lovable's own hosting, triggered by the Publish action inside the Lovable editor. Preview deployments are served from `*.lovable.app` subdomains.
- **Build:** Vite + Nitro, with Cloudflare Workers as the default server target (configurable in `vite.config.ts`).
- **CI/CD:** No GitHub Actions or other CI workflows currently exist in the repository — the deployment pipeline is entirely managed by Lovable, not by GitHub-side automation.
- **External dependencies at runtime:** The PreCheck CTA links out to two separate Lovable-hosted apps (`precheck-fg-01.lovable.app`, `precheck-de-01.lovable.app`); no other external services or APIs are called.

## Future Roadmap (Brief)

See [`docs/ROADMAP.md`](docs/ROADMAP.md) for the full version-by-version plan. In short:

- Near-term: UX refinement, landing page and CTA optimization, basic analytics.
- Mid-term: real PreCheck/FGPS integration, backend and data persistence, campaign tracking.
- Long-term: user history, an expanded learning dashboard, and a LAOS-market variant.

## License

License not yet determined. Add the appropriate license file and reference here before any public/external distribution of this codebase.
