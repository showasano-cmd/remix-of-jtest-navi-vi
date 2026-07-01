# Roadmap

Version-based development plan for J.TEST Navi Vietnam. Versions are aspirational planning targets, not committed release dates. Status reflects the state of this repository as of this document's creation.

## Status Legend

| Status | Meaning |
| --- | --- |
| Done | Implemented and present in the current codebase |
| In Progress | Partially implemented or actively being worked on |
| Planned | Scoped but not started |
| Idea | Under consideration, not yet scoped |

## Roadmap Table

| Version | Theme | Priority | Status | Dependencies | Expected Impact |
| --- | --- | --- | --- | --- | --- |
| v1.0 | Current release — goal selection, diagnosis engine, result screen, PreCheck CTA | — | Done | — | Baseline: users can self-diagnose exam readiness and reach PreCheck. |
| v1.1 | Minor UX improvements (loading/empty states, form validation messaging, accessibility pass) | High | Planned | v1.0 | Fewer drop-offs from confusing states; better usability on low-end devices. |
| v1.2 | Landing page optimization (hero copy testing, trust-badge iteration, above-the-fold clarity) | High | Planned | v1.1 | Improved click-through from ad/social traffic into the diagnosis flow. |
| v1.3 | Analytics (page views, funnel step completion, CTA click tracking) | High | Planned | v1.2 | Visibility into where users drop off; data to prioritize v1.4+. |
| v1.4 | Facebook campaign optimization (UTM handling, campaign-specific landing variants) | Medium | Planned | v1.3 | Better attribution and lower cost-per-diagnosis on paid traffic. |
| v1.5 | PreCheck integration improvements (pass diagnosis context to PreCheck, reduce re-entry) | Medium | Planned | v1.3 | Higher PreCheck completion rate; smoother handoff between tools. |
| v2.0 | Backend integration (persistent storage for diagnoses, server-side validation) | High | Planned | v1.3 | Enables all subsequent data-dependent features (history, analytics depth, LAOS variant). |
| v2.1 | LAOS integration (localized variant for the Laos market) | Medium | Idea | v2.0 | Expands the tool to a second country/market using the same diagnosis engine. |
| v2.2 | User history (returning users see past diagnoses and progress over time) | Medium | Idea | v2.0 | Encourages repeat visits; supports longer-term engagement. |
| v3.0 | Learning Dashboard (study plan, progress tracking, resource recommendations) | Low | Idea | v2.0, v2.2 | Evolves the product from a one-time diagnostic into an ongoing learning companion. |

## Notes

- v1.0 corresponds to the feature set described in the main [README](../README.md) — goal selection, a two-question input form, client-side diagnosis, and a result screen with a PreCheck CTA. FGPS and formal J.TEST registration are referenced in the UI but are not yet linked to real integrations; wiring those up is a prerequisite that will likely land alongside v1.5 or v2.0, whichever addresses it first.
- No backend, database, or analytics currently exist in the codebase (see README, "Current Implemented Features"). Everything from v1.3 onward that requires persisted data depends on v2.0 landing first, even where listed earlier for prioritization purposes — the ordering here reflects business priority, not strict technical sequencing.
- This roadmap should be revisited whenever a version ships; move completed items to the [CHANGELOG](../CHANGELOG.md) rather than leaving them marked "Done" here indefinitely.
