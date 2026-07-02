# JTEST Marketing Analytics Operating Knowledge v1.0

**Document type:** Operating Knowledge (not an implementation report)
**Purpose:** Explain why the current marketing analytics architecture was built and how it should be operated going forward
**Target reader:** Future project owner, and future AI assistants with no memory of this work
**Status:** Active — reflects state as of Phase 2-A completion
**Stack:** Facebook Ads + Lovable + GitHub + GA4

---

## 1. Background

Before this work, marketing measurement for J.TEST Navi Vietnam stopped at the ad platform boundary. Facebook Ads could report clicks and impressions on the ad itself, but nothing about what happened after a user landed on the app. It was impossible to answer basic questions such as: how many people who clicked the ad actually opened J.TEST Navi, how many engaged with it (selected a goal), how many completed a diagnosis, and how many moved toward the next real step — checking PreCheck.

This is a common but serious gap. Ad platforms measure ad performance, not product engagement. Without a bridge between the two, "the ad is doing well" and "the ad is bringing people who actually use the product" are two different, unverified claims. Budget decisions made on click/impression data alone are effectively guesses about what happens downstream.

The objective of this work was to close that gap: to build a measurable marketing funnel that connects an ad click all the way through to the meaningful in-product actions that indicate real interest, using tools already in place (Lovable for the frontend, GitHub as its source control, and GA4 as the measurement layer) rather than introducing new infrastructure.

---

## 2. Current Marketing Funnel

The current, measurable funnel is:

```
Facebook Advertisement
  ↓
J.TEST Navi (Lovable)
  ↓
goal_selected
  ↓
diagnosis_completed
  ↓
precheck_clicked
```

This is the **first measurable version** of the funnel. It captures the core path a genuinely interested user takes: they arrive from the ad, declare what they're trying to achieve (goal selection), complete the diagnostic experience, and click through toward PreCheck — the next real step in the J.TEST Vietnam funnel. Each arrow in this diagram corresponds to a real GA4 event already implemented and verified in production, not a planned or aspirational step.

It is deliberately not the entire possible funnel. It stops at `precheck_clicked` because that is where Phase 2-A's scope was intentionally bounded (see Section 4). The funnel is expected to extend further in future phases.

---

## 3. Why GA4 was introduced

Page views alone answer only one question: did someone load a page. They cannot answer whether that person did anything meaningful once they arrived. For a diagnostic tool like J.TEST Navi, the page view for the result screen looks identical whether the user actually completed a real diagnosis or bounced immediately — page views carry no information about intent or outcome.

Custom events solve this by attaching meaning to specific in-product actions: selecting a goal, completing a diagnosis, clicking through to PreCheck. These are the moments that actually indicate a user is progressing toward becoming a real lead, and they are what marketing decisions should be based on — not raw traffic volume.

A principle that has been enforced strictly throughout this implementation, and must continue to be enforced in every future phase: **analytics is an observer layer, not business logic.** GA4 code only watches what already happens in the app — a goal being selected, a diagnosis result being computed, a link being clicked. It must never determine, alter, or gate any of those things. Diagnosis calculation, routing, and UI must behave identically whether or not GA4 is present, reachable, or blocked by the user's browser. This separation is what keeps analytics safe to add, remove, or expand without risking the product itself.

---

## 4. Current Phase

**Phase 1 — standard page tracking (complete, live)**
- `page_view`
- `session_start`
- `first_visit`

**Phase 2-A — core funnel events (complete, live)**
- `goal_selected`
- `diagnosis_completed`
- `precheck_clicked`

**Phase 2-B — pending, intentionally postponed**
- `fgps_clicked`
- `jtest_application_clicked`

Phase 2-B was postponed on purpose, not overlooked. The reasoning:

- **Downstream products aren't fully wired yet.** FGPS and the J.TEST application flow are later stages in the broader product roadmap (see Section 7). Adding events for actions that don't yet have a stable, finished destination risks tracking something that will change shape before it's ever analyzed.
- **Phased rollout limits risk.** Each phase so far has been small enough to fully implement, verify in GA4 DebugView/Realtime, and confirm survives a Lovable Remix/Publish cycle before moving on. Bundling Phase 2-B in with 2-A would have made a single change larger and harder to verify cleanly.
- **The funnel should be extended in the order users actually move through it.** `goal_selected` → `diagnosis_completed` → `precheck_clicked` is the immediate, already-live path. `fgps_clicked` and `jtest_application_clicked` belong to the next step of the journey and are more meaningful to add once that step of the product itself is ready to measure.

Phase 2-B should be picked up as its own, separately scoped implementation prompt when FGPS and the J.TEST application flow are ready — following the same phased, no-inference discipline used for Phase 1 and Phase 2-A.

---

## 5. Repository Structure

GitHub is the single source of truth for both the application code and the documentation describing how its analytics are implemented. Nothing about the analytics architecture should be considered authoritative unless it is committed to the repository.

Recommended documentation layout:

```
docs/
  analytics/
    Analytics_Implementation_Spec_v1.0.md
    Analytics_Event_Definition_v1.0.md
    JTEST_Marketing_Analytics_Operating_Knowledge_v1.0.md   (this document)
```

- `Analytics_Implementation_Spec_v1.0.md` should describe the technical implementation as built — the contents of `src/lib/analytics.ts`, where `initGA()`, `trackPageView()`, and `trackEvent()` are called from, and any Remix/Publish-survival notes.
- `Analytics_Event_Definition_v1.0.md` should be the canonical list of every GA4 event currently implemented, its exact parameters, and their meaning — the same role the Canonical Test Master Schema plays for PreCheck question data. It should be updated the moment a new phase ships, not after the fact.
- This document (`JTEST_Marketing_Analytics_Operating_Knowledge_v1.0.md`) is the "why," not the "what" — it explains the reasoning and operating discipline, and should change far less often than the spec/definition documents.

If Google Drive is used anywhere in this workflow, it should hold operational outputs only — exported reports, ad-hoc analysis, screenshots of GA4 dashboards — never the authoritative definition of what was implemented or why. If a Drive document and a GitHub-committed document ever disagree, GitHub wins.

---

## 6. Daily Operation

Facebook Ads performance should never be evaluated using ad-platform metrics alone. The recommended sequence for reviewing ad performance:

```
1. Facebook Ads
   - Link Click
   - CTR
   - CPC
        ↓
2. GA4
   page_view
        ↓
   goal_selected
        ↓
   diagnosis_completed
        ↓
   precheck_clicked
```

Start in Facebook Ads to understand cost and reach — how much it costs to get a click, and how efficiently the ad copy/creative is generating clicks. Then move into GA4 and walk the funnel in order: did the click actually turn into a loaded page, did the visitor engage (goal selection), did they complete the core experience (diagnosis), and did they take the next real step (PreCheck).

A campaign with a low CPC but a steep drop-off between `page_view` and `goal_selected` is not actually a cheap, efficient campaign — it's cheap traffic that isn't engaging. A campaign with a higher CPC but strong completion through to `precheck_clicked` may be the better investment even though its top-line click cost looks worse. **Budget and creative decisions should be made using the shape of the entire funnel, not the click count or CPC in isolation.** This is the entire reason this architecture was built — to make that comparison possible in the first place.

---

## 7. Future Expansion

The planned long-term product path:

```
PreCheck FG
  ↓
PreCheck DE
  ↓
FGPS
  ↓
J.TEST Application
  ↓
LAOS analytics
```

J.TEST Navi's marketing funnel (Section 2) is the entry point into this larger path. As each downstream product stabilizes, its own key actions should get the same treatment PreCheck and J.TEST Navi have already received — a small number of well-defined, no-inference-compliant events added in a deliberately scoped phase, verified in GA4, and documented in `Analytics_Event_Definition`.

The long-term goal is for every product in this path — PreCheck FG, PreCheck DE, FGPS, the J.TEST application flow, and eventually LAOS-level analysis — to share one analytics standard: the same `trackEvent()`-style pattern, the same `app_name`/parameter discipline, the same phased rollout approach, and the same operating principles in Section 8. A shared standard means data from every product can eventually be compared and combined on the same terms, instead of each product inventing its own incompatible tracking approach.

---

## 8. Important Design Principles

- **GitHub is the source of truth.** Application code and analytics documentation are only authoritative once committed there.
- **Google Drive stores operational outputs only** — reports, exports, dashboards — never the authoritative implementation or definition record.
- **GA4 is an observer, not business logic.** Analytics code must never alter, gate, or depend on diagnosis calculation, routing, or UI behavior, and must never block navigation or product functionality if it fails.
- **Never duplicate analytics implementations.** There is exactly one initialization (`initGA()`), one page-tracking function (`trackPageView()`), and one generic event function (`trackEvent()`), in exactly one file. Every future phase reuses them.
- **Do not collect personal information.** No names, emails, phone numbers, or other PII in any event parameter, ever.
- **Expand by phases instead of implementing everything at once.** Each phase is scoped small enough to fully implement, verify, and document before the next begins — this is what has made Phase 1 and Phase 2-A safe to build and confirm working in production.

---

## Conclusion

This architecture is valuable to J.TEST Vietnam for reasons that go beyond simply "having more data." Before this work, marketing spend decisions were made on a signal — clicks and impressions — that says nothing about whether the product is actually working for the people it reaches. That gap made it structurally impossible to tell a cheap-but-ineffective campaign from an expensive-but-effective one, or to know whether a change to J.TEST Navi itself was helping or hurting real user engagement.

By connecting Facebook Ads through to `goal_selected`, `diagnosis_completed`, and `precheck_clicked`, marketing decisions can now be grounded in what users actually do, not just what they're shown. This turns advertising spend evaluation from a guess into a measurement, and it does so without touching or risking the product's actual business logic — the analytics layer only observes.

Just as importantly, the phased, no-inference, single-source-of-truth discipline used to build this (small scoped phases, no invented data, one implementation reused everywhere, documented in GitHub) is itself the long-term asset. It means Phase 2-B, PreCheck DE, FGPS, and the eventual J.TEST application flow can all be measured the same reliable way, extending this funnel product by product rather than rebuilding trust in the data from scratch each time. Over the long term, that consistency — not any single event or dashboard — is what will let J.TEST Vietnam make confident, evidence-based marketing decisions as the product line grows.

---

*Document version: 1.0*
*Applies to: J.TEST Navi Vietnam marketing analytics (Facebook Ads → Lovable → GA4)*
*Depends on: Phase 1 (page tracking) and Phase 2-A (goal_selected / diagnosis_completed / precheck_clicked) implementations*
*Supersedes: none — first version*
