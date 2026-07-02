# Analytics Event Definition v1.0

**Project:** J.TEST Navi Vietnam (`remix-of-jtest-navi-vi`)
**Document version:** 1.0
**Last updated:** 2026-07-02

This document is the single source of truth for all GA4 events in J.TEST Navi Vietnam. Update this document whenever an event is added, renamed, or changed. Do not rename events in code without updating this document first.

---

## Event Table

### 1. `page_view`

| Field | Value |
| --- | --- |
| **Status** | Implemented |
| **Trigger** | Page load (initial) and every client-side route / path change |
| **Fired from** | Route change observer in the router |

**Parameters:**

| Parameter | Type | Value |
| --- | --- | --- |
| `page_path` | string | Current URL path (e.g. `/`, `/result`) |

**Notes:** Standard GA4 SPA page tracking. Because J.TEST Navi is a single-page React app, `trackPageView(path)` is called explicitly on each navigation so GA4 sees each screen change as a separate page view. Without this, GA4 would record only one page view per session.

---

### 2. `session_start`

| Field | Value |
| --- | --- |
| **Status** | Implemented |
| **Trigger** | GA4 automatic — fires when a new session begins |
| **Fired from** | Automatically collected by GA4 on `gtag('config', ...)` |

**Parameters:** None custom. GA4 manages this event internally.

**Notes:** Automatically collected by GA4 as a result of `initGA()` calling `gtag('config', GA_MEASUREMENT_ID)`. No manual implementation required or present.

---

### 3. `first_visit`

| Field | Value |
| --- | --- |
| **Status** | Implemented |
| **Trigger** | GA4 automatic — fires on a user's first ever session on this property |
| **Fired from** | Automatically collected by GA4 on `gtag('config', ...)` |

**Parameters:** None custom. GA4 manages this event internally.

**Notes:** Automatically collected by GA4. No manual implementation required or present.

---

### 4. `goal_selected`

| Field | Value |
| --- | --- |
| **Status** | Implemented |
| **Trigger** | User selects or changes a goal card |
| **Fired from** | Goal card selection handler (onClick/onSelect) |

**Parameters:**

| Parameter | Type | Value / Notes |
| --- | --- | --- |
| `app_name` | string | `"jtest_navi"` — fixed constant |
| `goal` | string | The goal's existing internal value from app state (see known values below) |

**Known `goal` values:**

| Value | Meaning |
| --- | --- |
| `school` | Japanese language school admission (Du học Trường Nhật ngữ) |
| `thpt` | THPT foreign-language exemption (Miễn thi môn Ngoại ngữ THPT) |

**Notes:**
- Fires on every user selection or change, including re-selection after a goal has already been chosen.
- Does NOT fire on page load or on any automatic state initialization.
- The `goal` value is taken directly from existing app state. Do not hardcode or redefine the goal string inside analytics code — if the app's internal representation ever changes, the event should follow automatically.

---

### 5. `diagnosis_completed`

| Field | Value |
| --- | --- |
| **Status** | Implemented |
| **Trigger** | The result screen is rendered after a valid diagnosis |
| **Fired from** | Result screen component — on first render of the result view |

**Parameters:**

| Parameter | Type | Value / Notes |
| --- | --- | --- |
| `app_name` | string | `"jtest_navi"` — fixed constant |
| `goal` | string | Current goal value from app state (see `goal_selected` for known values) |
| `current_level` | string | User's selected current level (existing level option values from the input form) |
| `target_date` | string | User's selected target date/month in the format already used by the app (e.g. `"2027-04"`) |
| `result_status` | string | Computed diagnosis status (see known values below) — omitted if not available |
| `remaining_months` | number | Computed months remaining before the target date — omitted if not available |
| `recommended_exam` | string | Computed fastest-path exam (`"jtest"` or `"jlpt"`) |
| `recommended_exam_month` | string | Computed recommended exam session date (e.g. `"2026-09"`) |

**Known `result_status` values:**

| Value | Meaning |
| --- | --- |
| `ok` | User can reach the target on the recommended path (Có thể đạt được) |
| `warn` | Marginal — achievable but with limited margin (Chú ý) |
| `danger` | At risk — insufficient time on current path (Nguy hiểm) |

**Notes:**
- Guarded with `useRef` to ensure it fires at most once per diagnosis — never on re-render.
- `result_status` and `remaining_months` are only included if the app has computed a value for them in the current diagnosis outcome. If either is unavailable, the key is omitted from the params object entirely (not set to `null`, `0`, or an empty string).
- `target_date` and `current_level` are sent in whatever format the app already uses internally — they are not reformatted or recalculated for analytics purposes.

---

### 6. `precheck_clicked`

| Field | Value |
| --- | --- |
| **Status** | Implemented |
| **Trigger** | User clicks the PreCheck link or button on the result screen |
| **Fired from** | PreCheck button/link click handler — fires before navigation |

**Parameters:**

| Parameter | Type | Value / Notes |
| --- | --- | --- |
| `app_name` | string | `"jtest_navi"` — fixed constant |
| `goal` | string | Current goal value from app state |
| `destination` | string | Which PreCheck variant is being linked to (see known values below) — included only if the existing routing logic distinguishes the destination; omitted otherwise |
| `link_url` | string | The actual PreCheck URL being navigated to, read from the existing link/href value |

**Known `destination` values:**

| Value | PreCheck URL |
| --- | --- |
| `precheck_fg` | `precheck-fg-01.lovable.app` |
| `precheck_de` | `precheck-de-01.lovable.app` |

**Notes:**
- Analytics must not block or delay navigation to PreCheck. The `trackEvent()` call fires and the PreCheck page opens regardless of whether the GA4 request completes.
- If analytics fails (network error, ad blocker, gtag unavailable), navigation to PreCheck must proceed normally — the click handler must not propagate analytics exceptions.
- The `link_url` is read from the existing link/href in code; it is not hardcoded or duplicated inside the analytics call.
- The `destination` parameter is only included if the existing routing logic already distinguishes `precheck_fg` from `precheck_de`. If the code uses one undifferentiated link, `destination` is omitted.

---

### 7. `fgps_clicked`

| Field | Value |
| --- | --- |
| **Status** | Planned / Pending |
| **Trigger** | TBD |
| **Fired from** | TBD |

**Parameters:** TBD

**Notes:** Not implemented. FGPS is currently referenced in the result screen as a text-only step with no linked integration. The FGPS flow, payment/free model, and final destination URL are not finalized. This event will be defined and implemented once the FGPS integration is complete. Do not implement this event based on the text mention alone.

---

### 8. `jtest_application_clicked`

| Field | Value |
| --- | --- |
| **Status** | Planned / Pending |
| **Trigger** | TBD |
| **Fired from** | TBD |

**Parameters:** TBD

**Notes:** Not implemented. J.TEST registration is currently referenced in the result screen as a text-only step with no linked integration. The final J.TEST application destination, registration flow, and target URL are not finalized. This event will be defined and implemented once the registration link exists. Do not implement this event based on the text mention alone.

---

## Rules

These rules apply to all events, present and future.

1. **No personal data.** Do not include names, email addresses, phone numbers, Vietnamese ID numbers, or any value that identifies a specific individual. Only structured, enumerated values (goal codes, level codes, exam types, status codes) are permitted.

2. **No free-text user input.** Do not send any value that comes directly from a user-typed field. All parameters must come from controlled selects, computed values, or fixed constants.

3. **No duplicate GA initialization.** `initGA()` is called exactly once. There must be no second `gtag('config', ...)` call anywhere in the codebase.

4. **No renaming events without updating this document.** Changing an event name in code without updating this document creates a permanent split in the GA4 historical data. Always update this document first, then the code.

5. **No inferred values.** If a parameter value is not already computed and available at the moment the event fires, omit the key from the params object entirely. Do not default missing values to `0`, `""`, `"unknown"`, or any other placeholder. Invented defaults corrupt the data.

6. **No blocking navigation.** Any event fired alongside a navigation action (currently `precheck_clicked`) must use fire-and-forget semantics. Analytics errors must not propagate to the click handler.

7. **No scope creep.** Only events listed in this document with status "Implemented" exist in the codebase. If Lovable adds an event not listed here, it should be considered unintended and reviewed before accepting.

---

## Changelog

| Version | Date | Change |
| --- | --- | --- |
| 1.0 | 2026-07-02 | Initial document. Phase 1 (page_view, session_start, first_visit) and Phase 2-A (goal_selected, diagnosis_completed, precheck_clicked) documented. Phase 2-B (fgps_clicked, jtest_application_clicked) documented as pending. |
