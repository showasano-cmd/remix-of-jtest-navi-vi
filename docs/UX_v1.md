# UX Design Specification — v1

This document explains **why** J.TEST Navi Vietnam's interface is built the way it is. It is a rationale document, not a UI spec — for implementation details, read `src/routes/index.tsx` directly.

## Project Goal

J.TEST Navi Vietnam exists to guide Vietnamese learners of Japanese toward obtaining a Japanese-language certification — J.TEST or JLPT — **before a specific, self-declared target date**: either a Japanese language school intake month, or a THPT (high school) foreign-language exam year.

The tool's job is not to teach or motivate in the abstract. It is to answer a concrete, time-bound question the user already has in mind ("can I make it?") and to turn that answer into a specific next action. Every design decision below follows from that framing.

## UX Philosophy

### Reverse planning

The user does not start from "what do I study first." They start from a **deadline** (intake month or exam year) and a **starting point** (current level). The tool works backward from the deadline to determine the last exam session that still leaves enough preparation time, then forward again to show what to do starting today. This mirrors how the underlying decision actually gets made — the deadline is fixed, the study plan is the variable — so the tool should not force the user through a forward-planning narrative first.

### Reducing cognitive load

The entire input phase is two questions: a target date and a current level. There is no account creation, no multi-page wizard, and no free-text entry — every input is a single select or a small set of radio options. This keeps the decision-making surface small enough to complete in about 30 seconds, which is stated explicitly in the hero copy and reinforced with trust badges ("Miễn phí," "Chỉ 2 câu hỏi," "Không cần đăng ký").

### Smartphone-first design

The layout is a single centered column capped at `max-w-xl`, with generous touch targets (full-width radio rows, large buttons), a sticky bottom action bar, and no reliance on hover states. This reflects the primary usage context: a learner discovering the tool through a mobile ad or social link and completing the whole flow on a phone, one-handed, without zooming or horizontal scrolling.

### Quick diagnosis

The diagnosis is computed instantly and entirely client-side the moment the user submits the form — there is no loading state, server round-trip, or waiting screen. Speed here is not just a technical nicety; it preserves the "quick check" framing set up by the hero and trust badges. Any perceptible delay would contradict the promise already made to the user.

### Immediate conclusion

The result screen leads with a **Kết luận (Conclusion)** card before any supporting data. The user's core question — "can I make it?" — is answered in the first thing they see, in plain language ("Có thể kịp nếu bắt đầu ngay" / "Khó kịp — cần điều chỉnh kế hoạch"), with a one-line explanation of the fastest path. Everything below it (current status, requirement check, exam comparison, timeline, actions) is supporting evidence the user can read if they want to understand *why*, not information they must read to get the answer.

### Clear CTA

At every stage, there is exactly one primary action available: choose a goal, submit the form, or make PreCheck. Secondary information (badges, explanatory notes, the exam comparison cards) never competes visually with the primary action button. The sticky bottom bar keeps the single next step reachable regardless of how far the user has scrolled into the result screen.

## User Flow

```
Landing
  ↓
Choose goal        (Du học Trường Nhật ngữ  |  Miễn thi môn Ngoại ngữ THPT)
  ↓
Input               (target month/year + current level)
  ↓
Diagnosis           (client-side calculation, instant)
  ↓
PreCheck            (external CTA — free level-check tool)
  ↓
FGPS                (mentioned as a follow-up step; not yet linked)
  ↓
J.TEST               (final registration; not yet linked)
```

Landing, goal selection, and input all happen on a single scroll within one screen (`showResult === false`). Submitting swaps the view to the result screen (`showResult === true`) rather than navigating to a new route — this keeps the transition instant and avoids a page reload, reinforcing the "quick check" feel.

## Hero Section Design

The hero asks a direct, personal question — **"Bạn có kịp nhập học Trường Nhật ngữ tháng 4/2027 không?"** ("Will you make it in time for the April 2027 school intake?") — instead of describing the product ("a tool that compares J.TEST and JLPT exam schedules").

This is deliberate: a description invites evaluation ("is this relevant to me?"), while a question invites an answer. Framing the hero as the exact question the target user is already asking themselves removes the need for the user to translate a feature description into their own situation — they either have that anxiety already, in which case the headline names it precisely, or they don't, in which case the tool is not for them and a description would not have changed that. The trust badges beneath the headline (free, two questions, no signup) exist to remove the remaining hesitation — cost, effort, and commitment — before the user commits to answering.

## Result Screen Structure

The result screen is organized into a conclusion card plus five numbered sections, in this order:

1. **Conclusion card** — the direct answer, shown before any section number, so it reads as the headline rather than "step one."
2. **01 — Trình độ hiện tại và thời gian còn lại** (current level & time remaining) — grounds the conclusion in concrete numbers (months remaining, J.TEST opportunities, JLPT opportunities) so the user can sanity-check the claim before trusting it.
3. **02 — Kiểm tra yêu cầu** (requirement check) — restates the status with the reasoning behind it (why this much prep time is assumed for this level), addressing the natural follow-up question "why did it say that?"
4. **03 — J.TEST vs JLPT** — shows the comparison that produced the "fastest path" decision, because the recommendation to prefer one exam over the other is only credible if the user can see both options side by side.
5. **04 — Lộ trình thi được khuyến nghị** (recommended timeline) — converts the abstract comparison into a concrete sequence of dated milestones, answering "what happens when."
6. **05 — Hành động cần thực hiện ngay** (immediate actions) — the numbered, executable steps (PreCheck → FGPS → registration), ending the page on something the user can act on rather than something they merely understand.

This ordering moves the user from **belief** (the conclusion) to **evidence** (sections 01–04) to **action** (section 05) — each section answers the question raised by the one before it, and no section is placed before the question it answers has been asked.

## CTA Design

### Why PreCheck is shown first

The diagnosis in this tool is based on a self-reported level (a radio button choice), not a measured one. PreCheck is a free, low-friction way to replace that self-assessment with a real one, and it is the only action in the funnel the user can complete immediately, for free, without leaving intent behind. Putting it first — as both the first action in the list and the only link in the sticky bottom bar — converts the diagnosis into a next step the user can take in the same session, before their motivation from the "aha" moment fades.

### Why FGPS is introduced after PreCheck

FGPS is framed as something to do "nếu cần báo cáo chi tiết" (if a detailed report is needed) — a deeper, more committal step than PreCheck. Introducing it second respects a natural escalation: confirm your level cheaply and instantly first (PreCheck), and only invest in a more detailed diagnostic (FGPS) once that initial confirmation suggests it's worth it. Presenting FGPS before PreCheck would ask for more commitment before the user has any reason to trust the tool's assessment of their level.

### Why J.TEST registration is placed last

Formal exam registration is the highest-commitment, least-reversible action in the funnel — it typically involves cost and a fixed date. It is placed last because it should only be taken once the user has (a) trusted the diagnosis, (b) optionally confirmed their real level through PreCheck/FGPS, and (c) seen the specific exam session they're registering for named in the timeline above. Asking for registration first, before that trust is built, would be a premature commitment ask.

## Future UX Improvements

The following are ideas for future iteration, not commitments or current implementation:

- Turn the FGPS and J.TEST registration action items into real linked CTAs once those integrations exist.
- Add a lightweight progress indicator across goal → input → result, especially useful if the input step grows to more than two questions.
- Persist the user's last diagnosis (e.g. via local storage) so returning visitors skip straight to their result.
- Add a shareable/saveable result state (e.g. shareable link or downloadable summary) so users can revisit or share their diagnosis without re-entering data.
- Consider a lighter-weight "explain this" affordance on the requirement-check section for users who want the reasoning without reading the full section.
- Evaluate whether the two-goal model should expand (e.g. university admission, job-market certification) and how that affects the input step's simplicity.
- Explore localized variants of the hero question by traffic source (e.g. different target dates for different campaigns) instead of a single hard-coded date.
