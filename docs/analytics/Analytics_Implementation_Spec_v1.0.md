# Analytics Implementation Spec v1.0

**Project:** J.TEST Navi Vietnam (`remix-of-jtest-navi-vi`)
**GA4 Measurement ID:** G-L3YV2QM0VE
**Document version:** 1.0
**Status:** Phase 1 implemented. Phase 2-A implemented. Phase 2-B pending.

---

## Purpose

This document describes the Google Analytics 4 (GA4) implementation in J.TEST Navi Vietnam. It records what is implemented, why, and what is intentionally deferred.

---

## Background

J.TEST Navi Vietnam is a Facebook-ad-driven lead generation tool. The primary conversion funnel is:

```
Facebook Ad
  → Landing page (J.TEST Navi)
  → Goal selected
  → Diagnosis completed (result screen rendered)
  → PreCheck clicked (external link to PreCheck FG or PreCheck DE)
```

Analytics exists to make this funnel visible. Without it, there is no way to know where users drop off, whether the Facebook Ad is attracting the right audience, or whether PreCheck click-through rates are improving or degrading across site iterations.

---

## Architecture

GA4 is the sole analytics platform. There is no GTM, no Meta Pixel, no secondary analytics tool, and no backend logging of behavioral data.

The implementation is structured as a thin observer layer that reads existing app state and fires events. It does not participate in, alter, or depend on the outcome of any user-facing logic.

### Key design constraint

**Analytics must never affect:**
- Diagnosis calculation or results
- URL structure or routing
- PreCheck link destination or navigation behavior
- UI rendering or component state
- Any displayed output to the user

If analytics fails for any reason (network error, ad blocker, script load failure), the app must behave exactly as if analytics were absent. This is enforced in the implementation by wrapping all gtag calls in a no-throw guard and using fire-and-forget semantics for navigation-adjacent events.

### Implementation files

| File | Role |
| --- | --- |
| `src/lib/analytics.ts` | All analytics logic: GA4 constant, init, page-view tracking, generic event helper |
| `index.html` | Two standard `<script>` tags for async gtag.js bootstrap |
| Root route / router | Calls `initGA()` once on mount; listens for route changes to call `trackPageView()` |
| `src/routes/index.tsx` (or called components) | Call sites for `goal_selected`, `diagnosis_completed`, `precheck_clicked` |

---

## GA4 Property / Measurement ID

| Property | Value |
| --- | --- |
| Measurement ID | `G-L3YV2QM0VE` |
| Property name | J.TEST Navi Vietnam |
| Platform | GA4 (Google Analytics 4) |

The Measurement ID is stored as a single named constant (`GA_MEASUREMENT_ID`) in `src/lib/analytics.ts`. It must not be duplicated elsewhere.

---

## Phase 1: Standard Page Tracking

**Status:** Implemented

Covers the three standard GA4 events: `page_view`, `session_start`, and `first_visit`.

### What was implemented

1. `src/lib/analytics.ts` was created with:
   - `GA_MEASUREMENT_ID` — the Measurement ID constant.
   - `initGA()` — dynamically loads the gtag.js script and calls `gtag('config', GA_MEASUREMENT_ID)`. This one call causes GA4 to automatically collect `session_start` and `first_visit`.
   - `trackPageView(path: string)` — fires `gtag('event', 'page_view', { page_path: path })` for client-side route changes.

2. `index.html` received the two standard async gtag.js `<script>` tags in `<head>`.

3. The root component calls `initGA()` exactly once on mount.

4. The router's location observer calls `trackPageView()` on every route/path change.

### Why a manual `trackPageView()` call is required

J.TEST Navi is a React SPA. The stock gtag `page_view` fires only on the initial hard page load. Without a manual call on each client-side navigation, GA4 would record at most one page view per visit regardless of how many screens the user sees.

---

## Phase 2-A: Custom Funnel Events

**Status:** Implemented

Covers three custom events that map to the critical funnel steps between the landing page and PreCheck.

### What was implemented

A generic `trackEvent(eventName: string, params?: Record<string, unknown>)` helper was added to `src/lib/analytics.ts`. This function wraps `gtag('event', ...)` and fails silently if gtag is unavailable.

Call sites were added in the relevant components:

| Event | Where called |
| --- | --- |
| `goal_selected` | Goal card selection handler — fires on every user selection or change |
| `diagnosis_completed` | Result screen — fires once when diagnosis result is first displayed, guarded with `useRef` to prevent duplicate firing |
| `precheck_clicked` | PreCheck button/link click handler — fires before navigation, does not block or delay it |

For full event definitions, parameters, and known values, see [Analytics_Event_Definition_v1.0.md](./Analytics_Event_Definition_v1.0.md).

---

## Phase 2-B: Pending Events

**Status:** Planned / Not implemented

| Event | Reason not yet implemented |
| --- | --- |
| `fgps_clicked` | The FGPS flow, its paid/free model, and its destination URL are not finalized. Implementing the event before the destination is confirmed would produce unreliable data. |
| `jtest_application_clicked` | The final J.TEST application destination and click flow are not finalized. Registration is currently text-only in the result screen. |

These events will be scoped as part of the integration work for FGPS and J.TEST registration (expected alongside v1.5 or v2.0 — see `docs/ROADMAP.md`). Do not implement them earlier; premature tracking of an unlinked CTA produces noise, not signal.

---

## Implementation Principles

1. **Observer only.** Analytics code reads existing computed state. It does not produce, transform, or store any value that the app uses for rendering or business logic.

2. **Fail silently.** All gtag calls are wrapped in a no-throw guard. If gtag is not available (ad blocker, script failure), the wrapping function returns without error. The calling code never handles analytics exceptions.

3. **No blocking.** `precheck_clicked` fires and the navigation proceeds regardless of whether the GA4 request completed. Navigation must never be delayed or blocked by an analytics call.

4. **No personal data.** No event may contain a name, email, phone number, or any user-provided free-text value. Only structured, enumerated values (goal, level, exam type, status codes) are sent.

5. **No inference.** If a parameter value is unavailable (undefined or null) at the moment the event fires, the key is omitted from the params object entirely. A missing value must never be defaulted, guessed, or filled with a placeholder.

6. **Single initialization.** `initGA()` is called exactly once in the app's lifetime. There must never be two GA4 config calls or two analytics files.

7. **Survive Remix/Publish.** All analytics logic lives in `src/lib/analytics.ts` and the relevant component call sites — not in manually edited HTML that Lovable's build pipeline might regenerate. Only the unavoidable async gtag.js `<script>` bootstrap lives in `index.html`.

---

## Current File Locations

```
src/
  lib/
    analytics.ts          GA4 init, page-view tracking, generic event helper
index.html                gtag.js <script> bootstrap tags
docs/
  analytics/
    Analytics_Implementation_Spec_v1.0.md    (this file)
    Analytics_Event_Definition_v1.0.md       Event table and rules
```

---

## Verification Method

After any Publish or Remix:

1. Open the published site in Chrome with DevTools → Network tab filtered on `collect`.
2. Confirm a request fires on page load (Phase 1 — `page_view`).
3. Navigate between screens — confirm a new `page_view` request fires on each route change.
4. Select a goal card — confirm `goal_selected` fires with the correct `goal` value.
5. Complete a diagnosis — confirm exactly one `diagnosis_completed` fires with the expected parameters.
6. Click the PreCheck button — confirm `precheck_clicked` fires and PreCheck opens without delay.
7. Block the GA4 request (via ad blocker or DevTools request blocking) and click PreCheck again — confirm navigation still works.
8. Check GA4 DebugView or Realtime to confirm all events appear with expected parameters and no unexpected events appear.

See `GA4_Phase2A_Lovable_Implementation_Prompt.md` for the full verification checklist.

---

## Known Limitations

- **Self-reported level only.** The `current_level` parameter in `diagnosis_completed` is the user's own selection, not a measured level. PreCheck is the tool that converts this to a verified level; analytics cannot close that gap.
- **No UTM / campaign attribution yet.** Phase 1 and 2-A do not capture UTM parameters. Campaign attribution is planned for v1.4 (see `docs/ROADMAP.md`).
- **No cross-device or returning-user tracking.** Without a backend or user identity layer (planned for v2.0), GA4 can only observe anonymous sessions.
- **Ad blockers.** A meaningful share of users, especially those arriving via Facebook, may have ad blockers active. GA4 data should be interpreted as directionally correct, not as exact counts.
- **FGPS and J.TEST registration are not tracked.** These steps appear in the result screen as text only. They will be tracked once the linked integrations exist (Phase 2-B).

---

## Future Expansion

The following are planned or under consideration. None are implemented.

| Area | Notes |
| --- | --- |
| `fgps_clicked` | Track when FGPS integration exists (Phase 2-B) |
| `jtest_application_clicked` | Track when J.TEST registration link exists (Phase 2-B) |
| UTM / campaign parameters | Capture `utm_source`, `utm_campaign`, etc. on landing to attribute Facebook Ad traffic (v1.4) |
| PreCheck context pass-through | Pass diagnosis context into PreCheck so re-entry is minimized (v1.5) |
| PreCheck FG | Deepen funnel tracking into the PreCheck FG tool once it is integrated |
| PreCheck DE | Same as above for PreCheck DE |
| FGPS | Full funnel tracking through the FGPS paid assessment flow |
| DEPS | Track if DEPS assessment is added as a funnel step |
| LAOS variant | Separate GA4 property or filtered view for a potential Laos-market variant (v2.1) |
| Backend event logging | Server-side event recording once v2.0 backend exists, to reduce ad-blocker blind spots |
